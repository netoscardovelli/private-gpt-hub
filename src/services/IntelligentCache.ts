import { supabase } from '@/integrations/supabase/client';
import { createHash } from 'crypto';

interface CacheEntry {
  id: string;
  query_hash: string;
  query_normalized: string;
  response: string;
  specialty: string;
  hit_count: number;
  last_hit: string;
  created_at: string;
  expires_at: string;
  quality_score: number;
  metadata?: any;
}

class IntelligentCache {
  // Normaliza queries similares para mesmo hash
  private normalizeQuery(query: string, specialty: string): string {
    return query
      .toLowerCase()
      .trim()
      // Remove variações de dosagem específicas
      .replace(/\d+\s*(mg|mcg|g|ml|%)/gi, '[DOSE]')
      // Remove nomes específicos de pacientes
      .replace(/paciente\s+\w+/gi, 'paciente [NOME]')
      // Remove idades específicas
      .replace(/\d+\s*anos?/gi, '[IDADE] anos')
      // Remove variações de gênero
      .replace(/(masculino|feminino|homem|mulher)/gi, '[GENERO]')
      // Padroniza especialidade
      + `|${specialty}`;
  }

  private generateHash(normalizedQuery: string): string {
    // Use browser-compatible hash generation
    let hash = 0;
    for (let i = 0; i < normalizedQuery.length; i++) {
      const char = normalizedQuery.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  async findSimilarQuery(query: string, specialty: string): Promise<CacheEntry | null> {
    try {
      const normalized = this.normalizeQuery(query, specialty);
      const hash = this.generateHash(normalized);

      console.log('🔍 Buscando no cache:', { normalized, hash });

      // Primeiro: busca hash exato
      const { data: exactMatch } = await supabase
        .from('query_cache')
        .select('*')
        .eq('query_hash', hash)
        .gte('expires_at', new Date().toISOString())
        .order('quality_score', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (exactMatch) {
        console.log('✅ Cache hit exato encontrado');
        await this.updateHitStats(exactMatch.id);
        return exactMatch;
      }

      // Segundo: busca por similaridade semântica
      const similarQueries = await this.findSemanticallySimilar(normalized, specialty);
      
      if (similarQueries.length > 0) {
        console.log('✅ Cache hit semântico encontrado');
        const bestMatch = similarQueries[0];
        await this.updateHitStats(bestMatch.id);
        return bestMatch;
      }

      console.log('❌ Nenhum cache encontrado');
      return null;
    } catch (error) {
      console.error('Erro ao buscar cache:', error);
      return null;
    }
  }

  private async findSemanticallySimilar(
    normalizedQuery: string, 
    specialty: string
  ): Promise<CacheEntry[]> {
    try {
      // Busca queries na mesma especialidade com palavras-chave similares
      const keywords = this.extractKeywords(normalizedQuery);
      
      if (keywords.length === 0) return [];

      const { data } = await supabase
        .from('query_cache')
        .select('*')
        .eq('specialty', specialty)
        .gte('expires_at', new Date().toISOString())
        .gte('quality_score', 0.7) // Só respostas de boa qualidade
        .order('hit_count', { ascending: false })
        .limit(50);

      if (!data) return [];

      // Calcula score de similaridade
      const scoredResults = data
        .map(entry => ({
          ...entry,
          similarity: this.calculateSimilarity(normalizedQuery, entry.query_normalized)
        }))
        .filter(entry => entry.similarity > 0.8) // 80% de similaridade mínima
        .sort((a, b) => b.similarity - a.similarity);

      return scoredResults.slice(0, 3);
    } catch (error) {
      console.error('Erro na busca semântica:', error);
      return [];
    }
  }

  private extractKeywords(query: string): string[] {
    const stopWords = ['e', 'para', 'com', 'em', 'de', 'da', 'do', 'a', 'o', 'que', 'como', 'por', 'na', 'no'];
    
    return query
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !stopWords.includes(word.toLowerCase()))
      .map(word => word.toLowerCase());
  }

  private calculateSimilarity(query1: string, query2: string): number {
    const words1 = new Set(this.extractKeywords(query1));
    const words2 = new Set(this.extractKeywords(query2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0; // Jaccard similarity
  }

  async saveResponse(
    query: string, 
    specialty: string, 
    response: string,
    metadata: {
      provider: string;
      tokens?: number;
      processingTime?: number;
    }
  ): Promise<void> {
    try {
      const normalized = this.normalizeQuery(query, specialty);
      const hash = this.generateHash(normalized);
      
      // Cache por 7 dias para queries gerais, 1 dia para específicas
      const isGeneral = this.isGeneralQuery(query);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (isGeneral ? 7 : 1));

      // Score de qualidade baseado em tamanho, estrutura e provider
      const qualityScore = this.calculateQualityScore(response, metadata);

      console.log('💾 Salvando no cache:', { hash, qualityScore, isGeneral });

      await supabase
        .from('query_cache')
        .upsert({
          query_hash: hash,
          query_normalized: normalized,
          response,
          specialty,
          hit_count: 0,
          last_hit: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          quality_score: qualityScore,
          metadata
        });
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

  private isGeneralQuery(query: string): boolean {
    const generalPatterns = [
      /o que é/i,
      /como funciona/i,
      /quais são/i,
      /diferença entre/i,
      /indicação/i,
      /mecanismo de ação/i,
      /para que serve/i,
      /efeitos colaterais/i
    ];

    return generalPatterns.some(pattern => pattern.test(query));
  }

  private calculateQualityScore(response: string, metadata: any): number {
    let score = 0.5; // Base score

    // Tamanho da resposta (respostas muito curtas ou muito longas são penalizadas)
    const length = response.length;
    if (length > 500 && length < 3000) score += 0.2;
    if (length > 3000) score -= 0.1;
    if (length < 200) score -= 0.2;

    // Presença de referências científicas
    if (response.includes('estudo') || response.includes('pesquisa') || response.includes('referência')) {
      score += 0.2;
    }

    // Estrutura (listas, seções organizadas)
    if (response.includes('•') || response.includes('1.') || response.includes('**')) {
      score += 0.1;
    }

    // Provider premium
    if (metadata.provider === 'openai') score += 0.1;

    return Math.min(Math.max(score, 0), 1.0);
  }

  private async updateHitStats(cacheId: string): Promise<void> {
    try {
      // Usar atualização manual já que a função RPC não existe
      const { data: current } = await supabase
        .from('query_cache')
        .select('hit_count')
        .eq('id', cacheId)
        .single();

      if (current) {
        await supabase
          .from('query_cache')
          .update({
            hit_count: current.hit_count + 1,
            last_hit: new Date().toISOString()
          })
          .eq('id', cacheId);
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do cache:', error);
    }
  }

  // Limpeza automática de cache antigo/pouco usado
  async cleanupCache(): Promise<void> {
    try {
      // Remove entradas expiradas
      await supabase
        .from('query_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      // Remove entradas com baixo hit_count após 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await supabase
        .from('query_cache')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .eq('hit_count', 0);

      console.log('🧹 Cache cleanup concluído');
    } catch (error) {
      console.error('Erro no cleanup do cache:', error);
    }
  }
}

export const intelligentCache = new IntelligentCache();
export default IntelligentCache;
