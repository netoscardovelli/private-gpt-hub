import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Wand2, Check, X, Edit, Scissors } from 'lucide-react';

interface ExtractedFormula {
  name: string;
  category: string;
  pharmaceutical_form: string;
  specialty: string;
  description?: string;
  clinical_indication?: string;
  actives: {
    name: string;
    concentration_mg: number;
    concentration_text: string;
    role?: string;
  }[];
}

const FormulaImporter = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFormulas, setExtractedFormulas] = useState<ExtractedFormula[]>([]);
  const [editingFormula, setEditingFormula] = useState<number | null>(null);
  const { toast } = useToast();

  const extractFormulasWithAI = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Cole o texto com as fórmulas para análise.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🧪 Iniciando extração baseada em posologias...');
      
      // Primeiro, tentar extração manual baseada em posologias
      const manualFormulas = extractFormulasByPosology(inputText);
      console.log(`📋 Extração manual: ${manualFormulas.length} fórmulas identificadas`);
      
      if (manualFormulas.length > 0) {
        setExtractedFormulas(manualFormulas);
        toast({
          title: "Fórmulas extraídas!",
          description: `${manualFormulas.length} fórmula(s) identificada(s) pelo padrão de posologia.`,
        });
        return;
      }

      // Se a extração manual não funcionou, usar IA como fallback
      console.log('🤖 Usando IA como fallback...');
      const textChunks = splitTextIntoChunks(inputText);
      console.log(`Texto dividido em ${textChunks.length} seções`);
      
      const allFormulas: ExtractedFormula[] = [];
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`Processando seção ${i + 1}/${textChunks.length}`);
        
        try {
          const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: {
              message: `IMPORTANTE: As posologias (como "1x ao dia", "tomar à noite") marcam o FIM de uma fórmula.
              
Analise este texto seguindo essa regra:
- Tudo antes de uma posologia pertence à mesma fórmula
- Tudo após uma posologia é uma nova fórmula
- Agrupe ativos corretamente por fórmula

Retorne APENAS um JSON válido:
[
  {
    "name": "Nome da Fórmula",
    "category": "categoria",
    "pharmaceutical_form": "cápsulas|óvulos|pomada|sabonete|creme|sachê",
    "specialty": "ginecologia|urologia|endocrinologia|geral",
    "clinical_indication": "indicação",
    "actives": [
      {
        "name": "Nome do Ativo",
        "concentration_mg": 1000,
        "concentration_text": "1 bilhão"
      }
    ]
  }
]

TEXTO:
${chunk}`,
              specialty: 'geral'
            }
          });

          if (error) {
            console.error(`Erro na seção ${i + 1}:`, error);
            continue;
          }

          if (data?.response) {
            try {
              const sectionFormulas = parseAIResponse(data.response);
              console.log(`Seção ${i + 1}: ${sectionFormulas.length} fórmulas extraídas`);
              allFormulas.push(...sectionFormulas);
            } catch (parseError) {
              console.error(`Erro ao processar seção ${i + 1}:`, parseError);
            }
          }
        } catch (sectionError: any) {
          console.error(`Erro na seção ${i + 1}:`, sectionError);
          continue;
        }
      }

      console.log(`Processamento concluído: ${allFormulas.length} fórmulas no total`);

      if (allFormulas.length === 0) {
        throw new Error('Nenhuma fórmula foi extraída do texto');
      }

      setExtractedFormulas(allFormulas);
      
      toast({
        title: "Fórmulas extraídas!",
        description: `${allFormulas.length} fórmula(s) identificada(s) no texto.`,
      });

    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro na extração",
        description: error.message || "Não foi possível extrair as fórmulas.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractFormulasByPosology = (text: string): ExtractedFormula[] => {
    console.log('🔍 Iniciando extração baseada em posologias...');
    const formulas: ExtractedFormula[] = [];
    
    // Padrões para identificar posologias (fim de fórmula)
    const posologyPatterns = [
      /(\d+x?\s*ao\s*dia)/i,
      /(tomar.*noite)/i,
      /(tomar.*manhã)/i,
      /(aplicar.*dia)/i,
      /(usar.*vezes)/i,
      /(posologia:?.*)/i,
      /(modo de uso:?.*)/i,
      /(administração:?.*)/i,
      /(dosagem:?.*)/i
    ];
    
    // Dividir o texto em linhas
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentFormula: ExtractedFormula | null = null;
    let formulaIndex = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`📝 Analisando linha ${i + 1}: "${line}"`);
      
      // Verificar se a linha é uma posologia (fim de fórmula)
      const isPosology = posologyPatterns.some(pattern => pattern.test(line));
      
      if (isPosology) {
        console.log(`💊 Posologia identificada: "${line}"`);
        
        // Se temos uma fórmula em andamento, finalizá-la
        if (currentFormula && currentFormula.actives.length > 0) {
          console.log(`✅ Finalizando fórmula: "${currentFormula.name}" com ${currentFormula.actives.length} ativos`);
          formulas.push(currentFormula);
        }
        
        // Resetar para próxima fórmula
        currentFormula = null;
        continue;
      }
      
      // Verificar se é início de nova seção/fórmula (título)
      const isTitle = line.length > 10 && 
        (line.includes('Tratamento') || 
         line.includes('TPM') || 
         line.includes('Libido') || 
         line.includes('Óvulos') || 
         line.includes('Pomada') || 
         line.includes('Sabonete') || 
         line.includes('CREME') || 
         line.includes('DISFUNÇÃO') ||
         line.includes('Prevenção') ||
         /^[A-Z\s]+:?$/.test(line));
      
      if (isTitle && !currentFormula) {
        console.log(`🏷️ Título de fórmula identificado: "${line}"`);
        currentFormula = createNewFormula(line, formulaIndex++);
        continue;
      }
      
      // Tentar extrair ativo da linha
      const active = extractActiveFromLine(line);
      if (active) {
        // Se não temos fórmula atual, criar uma genérica
        if (!currentFormula) {
          currentFormula = createNewFormula(`Fórmula ${formulaIndex++}`, formulaIndex - 1);
        }
        
        console.log(`🧬 Ativo extraído: ${active.name} - ${active.concentration_text}`);
        currentFormula.actives.push(active);
      }
    }
    
    // Adicionar última fórmula se houver
    if (currentFormula && currentFormula.actives.length > 0) {
      console.log(`✅ Finalizando última fórmula: "${currentFormula.name}" com ${currentFormula.actives.length} ativos`);
      formulas.push(currentFormula);
    }
    
    console.log(`🎯 Extração concluída: ${formulas.length} fórmulas identificadas`);
    return formulas;
  };

  const createNewFormula = (name: string, index: number): ExtractedFormula => {
    const cleanName = name.replace(/^[-•]\s*/, '').trim();
    
    // Detectar forma farmacêutica
    let pharmaceutical_form = 'cápsulas';
    const nameLower = cleanName.toLowerCase();
    if (nameLower.includes('óvulo')) pharmaceutical_form = 'óvulos';
    else if (nameLower.includes('pomada')) pharmaceutical_form = 'pomada';
    else if (nameLower.includes('sabonete')) pharmaceutical_form = 'sabonete';
    else if (nameLower.includes('creme')) pharmaceutical_form = 'creme';
    else if (nameLower.includes('sachê')) pharmaceutical_form = 'sachê';
    
    // Detectar especialidade
    let specialty = 'geral';
    if (nameLower.includes('vagina') || nameLower.includes('óvulo') || nameLower.includes('tpm')) {
      specialty = 'ginecologia';
    } else if (nameLower.includes('libido') || nameLower.includes('eret') || nameLower.includes('disfunção')) {
      specialty = 'urologia';
    } else if (nameLower.includes('emagre') || nameLower.includes('performance')) {
      specialty = 'endocrinologia';
    }
    
    return {
      name: cleanName || `Fórmula ${index}`,
      category: 'Geral',
      pharmaceutical_form,
      specialty,
      clinical_indication: cleanName,
      actives: []
    };
  };

  const extractActiveFromLine = (line: string): { name: string; concentration_mg: number; concentration_text: string; role?: string } | null => {
    // Ignorar linhas que claramente não são ativos
    if (line.includes('Tomar') || 
        line.includes('Aplicar') || 
        line.includes('Usar') ||
        line.length < 5 ||
        /^\d+[x\s]*ao\s*dia/i.test(line)) {
      return null;
    }
    
    // Padrões para extrair ativos com concentrações
    const patterns = [
      // Bilhões/blh
      /(.+?)\s+(\d+(?:\.\d+)?)\s*(?:bilhão|bilhões|blh)/i,
      // Miligramas
      /(.+?)\s+(\d+(?:\.\d+)?)\s*mg/i,
      // Microgramas
      /(.+?)\s+(\d+(?:\.\d+)?)\s*mcg/i,
      // Unidades Internacionais
      /(.+?)\s+(\d+(?:\.\d+)?)\s*UI/i,
      // Percentuais
      /(.+?)\s+(\d+(?:\.\d+)?)\s*%/i,
      // Formato especial (Ex: "Ativo 100")
      /(.+?)\s+(\d+(?:\.\d+)?)$/
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let name = match[1].trim();
        const value = parseFloat(match[2]);
        
        // Limpar nome do ativo
        name = name.replace(/^[-•]\s*/, '').trim();
        
        if (name.length < 3 || value <= 0) continue;
        
        // Converter concentrações
        let concentration_mg = value;
        const unit = line.toLowerCase();
        
        if (unit.includes('bilhão') || unit.includes('blh')) {
          concentration_mg = value * 1000;
        } else if (unit.includes('mcg')) {
          concentration_mg = value / 1000;
        } else if (unit.includes('%')) {
          concentration_mg = value * 100;
        }
        
        return {
          name,
          concentration_mg,
          concentration_text: match[0].trim(),
          role: null
        };
      }
    }
    
    return null;
  };

  const splitTextIntoChunks = (text: string): string[] => {
    const sections: string[] = [];
    const lines = text.split('\n');
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      const isNewSection = line && (
        line.includes('Tratamento') ||
        line.includes('Prevenção') ||
        line.includes('TPM') ||
        line.includes('Libido') ||
        line.includes('DISFUNÇÃO') ||
        line.includes('Óvulos') && currentSection.length > 200 ||
        line.includes('Pomada') ||
        line.includes('Sabonete') ||
        line.includes('CREME') ||
        line.includes('ejaculação')
      );

      if (isNewSection && currentSection.length > 50) {
        sections.push(currentSection.trim());
        currentSection = line;
      } else {
        currentSection += '\n' + line;
      }
    }
    
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }

    const finalSections: string[] = [];
    sections.forEach(section => {
      if (section.length <= 1500) {
        finalSections.push(section);
      } else {
        const chunks = section.match(/.{1,1500}/g) || [section];
        finalSections.push(...chunks);
      }
    });

    return finalSections.filter(s => s.length > 20);
  };

  const parseAIResponse = (responseText: string): ExtractedFormula[] => {
    console.log('Tentando extrair JSON da resposta...');

    let jsonText = '';
    
    const arrayMatch = responseText.match(/\[[\s\S]*?\]/);
    if (arrayMatch) {
      jsonText = arrayMatch[0];
    } else {
      const objectMatch = responseText.match(/\{[\s\S]*?\}/);
      if (objectMatch) {
        jsonText = `[${objectMatch[0]}]`;
      }
    }

    if (!jsonText) {
      throw new Error('Nenhum JSON encontrado na resposta');
    }

    jsonText = jsonText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .trim();

    try {
      const parsedData = JSON.parse(jsonText);
      let formulasArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      return formulasArray
        .filter(formula => formula && typeof formula === 'object')
        .map((formula, index) => ({
          name: String(formula.name || `Fórmula ${index + 1}`).trim(),
          category: String(formula.category || 'Geral').trim(),
          pharmaceutical_form: String(formula.pharmaceutical_form || 'cápsulas').trim(),
          specialty: String(formula.specialty || 'geral').trim(),
          description: formula.description || null,
          clinical_indication: formula.clinical_indication || null,
          actives: (formula.actives || [])
            .filter((active: any) => active && (active.name || active.nome))
            .map((active: any) => ({
              name: String(active.name || active.nome).trim(),
              concentration_mg: Number(active.concentration_mg || 0),
              concentration_text: String(active.concentration_text || active.name || active.nome).trim(),
              role: active.role || null
            }))
        }))
        .filter(formula => formula.actives.length > 0);
    } catch (error) {
      console.error('Erro no parse JSON:', error);
      throw new Error('JSON malformado na resposta da IA');
    }
  };

  const saveFormulasToDatabase = async () => {
    if (extractedFormulas.length === 0) return;

    setIsProcessing(true);
    let savedCount = 0;
    const errors: string[] = [];

    try {
      for (const [index, formula] of extractedFormulas.entries()) {
        try {
          console.log(`Salvando fórmula ${index + 1}:`, formula.name);
          
          const formulaData = {
            name: formula.name,
            category: formula.category,
            pharmaceutical_form: formula.pharmaceutical_form,
            specialty: formula.specialty,
            description: formula.description,
            clinical_indication: formula.clinical_indication,
            target_dosage_per_day: 1,
            capsules_per_dose: 1
          };

          const { data: insertedFormula, error: formulaError } = await supabase
            .from('reference_formulas')
            .insert(formulaData)
            .select()
            .single();

          if (formulaError) {
            console.error('Erro ao inserir fórmula:', formulaError);
            errors.push(`Erro ao salvar fórmula "${formula.name}": ${formulaError.message}`);
            continue;
          }

          if (!insertedFormula?.id) {
            errors.push(`Fórmula "${formula.name}" não foi salva corretamente`);
            continue;
          }

          const activesToInsert = formula.actives.map(active => ({
            formula_id: insertedFormula.id,
            active_name: active.name,
            concentration_mg: active.concentration_mg,
            concentration_text: active.concentration_text,
            role_in_formula: active.role
          }));

          const { error: activesError } = await supabase
            .from('reference_formula_actives')
            .insert(activesToInsert);

          if (activesError) {
            console.error('Erro ao inserir ativos:', activesError);
            errors.push(`Erro ao salvar ativos da fórmula "${formula.name}": ${activesError.message}`);
            continue;
          }

          savedCount++;
          console.log(`Fórmula "${formula.name}" salva com sucesso`);

        } catch (formulaError: any) {
          console.error(`Erro ao processar fórmula ${index + 1}:`, formulaError);
          errors.push(`Erro na fórmula ${index + 1}: ${formulaError.message}`);
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Fórmulas salvas!",
          description: `${savedCount} fórmula(s) adicionada(s) ao banco de dados.`,
        });

        setExtractedFormulas([]);
        setInputText('');
      }

      if (errors.length > 0) {
        console.error('Erros durante o salvamento:', errors);
        toast({
          title: errors.length === extractedFormulas.length ? "Erro ao salvar" : "Salvamento parcial",
          description: `${errors.length} erro(s) encontrado(s).`,
          variant: errors.length === extractedFormulas.length ? "destructive" : "default"
        });
      }

    } catch (error: any) {
      console.error('Erro geral ao salvar fórmulas:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro inesperado ao salvar fórmulas.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateFormula = (index: number, updatedFormula: ExtractedFormula) => {
    const newFormulas = [...extractedFormulas];
    newFormulas[index] = updatedFormula;
    setExtractedFormulas(newFormulas);
    setEditingFormula(null);
  };

  const removeFormula = (index: number) => {
    const newFormulas = extractedFormulas.filter((_, i) => i !== index);
    setExtractedFormulas(newFormulas);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Importar Fórmulas via Texto</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="formula-text">
              Cole o texto com as fórmulas (agora com detecção inteligente por posologia!)
            </Label>
            <Textarea
              id="formula-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui o texto com as fórmulas... 

NOVO: O sistema agora identifica automaticamente onde uma fórmula termina baseado nas posologias (ex: '1x ao dia', 'tomar à noite', etc.)"
              className="min-h-[200px]"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={extractFormulasWithAI}
              disabled={!inputText.trim() || isProcessing}
              className="flex-1"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Extrair Fórmulas (Detecção por Posologia)'}
            </Button>
            
            {inputText.length > 1500 && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                <Scissors className="w-4 h-4 mr-1" />
                Texto longo - será dividido em seções
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fórmulas Extraídas */}
      {extractedFormulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fórmulas Extraídas ({extractedFormulas.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedFormulas.map((formula, index) => (
              <Card key={index} className="border-l-4 border-l-emerald-500">
                <CardContent className="pt-4">
                  {editingFormula === index ? (
                    <EditFormulaForm 
                      formula={formula}
                      onSave={(updated) => updateFormula(index, updated)}
                      onCancel={() => setEditingFormula(null)}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{formula.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formula.category} • {formula.pharmaceutical_form} • {formula.specialty}
                          </p>
                          {formula.description && (
                            <p className="text-sm mt-1">{formula.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingFormula(index)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFormula(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Ativos ({formula.actives.length}):</h4>
                        <div className="grid gap-2">
                          {formula.actives.map((active, activeIndex) => (
                            <div key={activeIndex} className="bg-slate-50 p-2 rounded text-sm">
                              <span className="font-medium">{active.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {active.concentration_text} 
                                {active.concentration_mg > 0 && ` (${active.concentration_mg}mg)`}
                              </span>
                              {active.role && (
                                <span className="text-emerald-600 ml-2">• {active.role}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Button 
              onClick={saveFormulasToDatabase}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              {isProcessing ? 'Salvando...' : `Salvar ${extractedFormulas.length} Fórmula(s) no Banco`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EditFormulaForm = ({ 
  formula, 
  onSave, 
  onCancel 
}: { 
  formula: ExtractedFormula; 
  onSave: (formula: ExtractedFormula) => void;
  onCancel: () => void;
}) => {
  const [editedFormula, setEditedFormula] = useState<ExtractedFormula>(formula);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome da Fórmula</Label>
          <Input 
            value={editedFormula.name}
            onChange={(e) => setEditedFormula({...editedFormula, name: e.target.value})}
          />
        </div>
        <div>
          <Label>Categoria</Label>
          <Input 
            value={editedFormula.category}
            onChange={(e) => setEditedFormula({...editedFormula, category: e.target.value})}
          />
        </div>
        <div>
          <Label>Forma Farmacêutica</Label>
          <Select 
            value={editedFormula.pharmaceutical_form}
            onValueChange={(value) => setEditedFormula({...editedFormula, pharmaceutical_form: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cápsulas">Cápsulas</SelectItem>
              <SelectItem value="comprimidos">Comprimidos</SelectItem>
              <SelectItem value="óvulos">Óvulos</SelectItem>
              <SelectItem value="pomada">Pomada</SelectItem>
              <SelectItem value="gel">Gel</SelectItem>
              <SelectItem value="creme">Creme</SelectItem>
              <SelectItem value="solução">Solução</SelectItem>
              <SelectItem value="xarope">Xarope</SelectItem>
              <SelectItem value="sachê">Sachê</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Especialidade</Label>
          <Select 
            value={editedFormula.specialty}
            onValueChange={(value) => setEditedFormula({...editedFormula, specialty: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ginecologia">Ginecologia</SelectItem>
              <SelectItem value="endocrinologia">Endocrinologia</SelectItem>
              <SelectItem value="dermatologia">Dermatologia</SelectItem>
              <SelectItem value="medicina esportiva">Medicina Esportiva</SelectItem>
              <SelectItem value="urologia">Urologia</SelectItem>
              <SelectItem value="cardiologia">Cardiologia</SelectItem>
              <SelectItem value="geral">Medicina Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={() => onSave(editedFormula)} size="sm">
          <Check className="w-4 h-4 mr-1" />
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="w-4 h-4 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default FormulaImporter;
