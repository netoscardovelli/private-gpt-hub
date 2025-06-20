
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

export interface ReferenceFormula {
  id: string;
  name: string;
  category: string;
  pharmaceutical_form: string;
  target_dosage_per_day: number;
  total_weight_mg: number | null;
  capsules_per_dose: number | null;
  specialty: string;
  description: string | null;
  clinical_indication: string | null;
}

export interface FormulaActive {
  id: string;
  formula_id: string;
  active_name: string;
  concentration_mg: number;
  concentration_text: string | null;
  role_in_formula: string | null;
  mechanism_notes: string | null;
}

export interface Incompatibility {
  id: string;
  active_1: string;
  active_2: string;
  incompatibility_type: string;
  severity: string;
  notes: string | null;
}

export const getReferenceFormulas = async (category?: string, specialty?: string): Promise<ReferenceFormula[]> => {
  try {
    let query = supabaseClient
      .from('reference_formulas')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (specialty) {
      query = query.eq('specialty', specialty);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Erro ao buscar fórmulas de referência:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro geral ao buscar fórmulas:', error);
    return [];
  }
};

export const getFormulaActives = async (formulaId: string): Promise<FormulaActive[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('reference_formula_actives')
      .select('*')
      .eq('formula_id', formulaId)
      .order('active_name');

    if (error) {
      console.error('Erro ao buscar ativos da fórmula:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro geral ao buscar ativos:', error);
    return [];
  }
};

export const getActiveIncompatibilities = async (activeNames: string[]): Promise<Incompatibility[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('active_incompatibilities')
      .select('*')
      .or(
        activeNames.map(name => 
          `active_1.eq.${name},active_2.eq.${name}`
        ).join(',')
      );

    if (error) {
      console.error('Erro ao buscar incompatibilidades:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro geral ao buscar incompatibilidades:', error);
    return [];
  }
};

export const findSimilarFormulas = async (actives: string[], category?: string): Promise<ReferenceFormula[]> => {
  try {
    // Buscar fórmulas que contenham ativos similares
    const { data: formulaActives, error: activesError } = await supabaseClient
      .from('reference_formula_actives')
      .select('formula_id, active_name')
      .in('active_name', actives);

    if (activesError) {
      console.error('Erro ao buscar ativos similares:', error);
      return [];
    }

    if (!formulaActives || formulaActives.length === 0) return [];

    // Contar quantos ativos cada fórmula tem em comum
    const formulaMatches = formulaActives.reduce((acc, active) => {
      acc[active.formula_id] = (acc[active.formula_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ordenar por número de ativos em comum
    const sortedFormulaIds = Object.entries(formulaMatches)
      .sort(([,a], [,b]) => b - a)
      .map(([id]) => id)
      .slice(0, 5); // Top 5 fórmulas similares

    if (sortedFormulaIds.length === 0) return [];

    // Buscar detalhes das fórmulas
    let query = supabaseClient
      .from('reference_formulas')
      .select('*')
      .in('id', sortedFormulaIds);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: formulas, error } = await query.order('name');

    if (error) {
      console.error('Erro ao buscar fórmulas similares:', error);
      return [];
    }

    return formulas || [];
  } catch (error) {
    console.error('Erro geral ao buscar fórmulas similares:', error);
    return [];
  }
};

export const getActiveConcentrationReference = async (activeName: string): Promise<FormulaActive[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('reference_formula_actives')
      .select('*, reference_formulas(pharmaceutical_form, category)')
      .ilike('active_name', `%${activeName}%`)
      .order('concentration_mg', { ascending: false });

    if (error) {
      console.error('Erro ao buscar referências de concentração:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro geral ao buscar referências:', error);
    return [];
  }
};

export const buildReferenceContext = async (userMessage: string, specialty: string): Promise<string> => {
  try {
    // Extrair possíveis nomes de ativos da mensagem do usuário
    const possibleActives = extractActivesFromMessage(userMessage);
    
    if (possibleActives.length === 0) return '';

    // Buscar fórmulas similares
    const similarFormulas = await findSimilarFormulas(possibleActives, undefined);
    
    // Buscar incompatibilidades
    const incompatibilities = await getActiveIncompatibilities(possibleActives);
    
    // Buscar referências de concentração
    const concentrationRefs = await Promise.all(
      possibleActives.map(active => getActiveConcentrationReference(active))
    );

    let context = '\n\n🏭 CONTEXTO DO BANCO DE FÓRMULAS DE REFERÊNCIA:\n';

    // Adicionar fórmulas similares encontradas
    if (similarFormulas.length > 0) {
      context += '\nFÓRMULAS DE REFERÊNCIA SIMILARES ENCONTRADAS:\n';
      for (const formula of similarFormulas.slice(0, 3)) {
        const actives = await getFormulaActives(formula.id);
        context += `- ${formula.name} (${formula.pharmaceutical_form})\n`;
        context += `  Categoria: ${formula.category} | ${formula.capsules_per_dose || '?'} cáps/dose\n`;
        context += `  Ativos: ${actives.map(a => `${a.active_name} ${a.concentration_text || a.concentration_mg + 'mg'}`).join(', ')}\n`;
      }
    }

    // Adicionar referências de concentração
    const flatConcentrationRefs = concentrationRefs.flat();
    if (flatConcentrationRefs.length > 0) {
      context += '\nREFERÊNCIAS DE CONCENTRAÇÃO:\n';
      const groupedByActive = flatConcentrationRefs.reduce((acc, ref) => {
        if (!acc[ref.active_name]) acc[ref.active_name] = [];
        acc[ref.active_name].push(ref);
        return acc;
      }, {} as Record<string, FormulaActive[]>);

      Object.entries(groupedByActive).forEach(([activeName, refs]) => {
        context += `- ${activeName}: `;
        const concentrations = [...new Set(refs.map(r => r.concentration_text || `${r.concentration_mg}mg`))];
        context += concentrations.slice(0, 3).join(', ') + '\n';
      });
    }

    // Adicionar incompatibilidades
    if (incompatibilities.length > 0) {
      context += '\n⚠️ INCOMPATIBILIDADES CONHECIDAS:\n';
      incompatibilities.forEach(inc => {
        context += `- ${inc.active_1} + ${inc.active_2}: ${inc.incompatibility_type} (${inc.severity})\n`;
        if (inc.notes) context += `  Nota: ${inc.notes}\n`;
      });
    }

    return context;
  } catch (error) {
    console.error('Erro ao construir contexto de referência:', error);
    return '';
  }
};

const extractActivesFromMessage = (message: string): string[] => {
  // Lista básica de ativos comuns para detecção
  const commonActives = [
    'clomifeno', 'arginina', 'tadalafil', 'turkesterone', 'creatina', 'hmb',
    'tribulus', 'maca', 'zinco', 'magnesio', 'vitamina d', 'colageno',
    'acido hialuronico', 'resveratrol', 'curcuma', 'omega 3', 'probioticos',
    'melatonina', 'triptofano', 'gaba', 'ashwagandha', 'rhodiola',
    'cafeina', 'taurina', 'beta alanina', 'citrulina', 'glutamina'
  ];

  const messageLower = message.toLowerCase();
  const foundActives: string[] = [];

  commonActives.forEach(active => {
    if (messageLower.includes(active)) {
      foundActives.push(active);
    }
  });

  return foundActives;
};
