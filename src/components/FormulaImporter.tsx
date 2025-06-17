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

  const splitTextIntoChunks = (text: string): string[] => {
    // Dividir por seções baseadas em títulos ou fórmulas distintas
    const sections: string[] = [];
    const lines = text.split('\n');
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar início de nova seção (títulos, indicações principais)
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

    // Se ainda estiver muito grande, dividir por tamanho
    const finalSections: string[] = [];
    sections.forEach(section => {
      if (section.length <= 1500) {
        finalSections.push(section);
      } else {
        // Dividir seções muito grandes
        const chunks = section.match(/.{1,1500}/g) || [section];
        finalSections.push(...chunks);
      }
    });

    return finalSections.filter(s => s.length > 20);
  };

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
      console.log('Dividindo texto em seções menores...');
      const textChunks = splitTextIntoChunks(inputText);
      console.log(`Texto dividido em ${textChunks.length} seções`);
      
      const allFormulas: ExtractedFormula[] = [];
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`Processando seção ${i + 1}/${textChunks.length} (${chunk.length} caracteres)`);
        
        try {
          const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: {
              message: `Analise APENAS este texto e extraia TODAS as fórmulas farmacêuticas encontradas.

INSTRUÇÕES IMPORTANTES:
1. Retorne APENAS um JSON válido com array de fórmulas
2. 1 bilhão = 1000mg, 2 bilhões = 2000mg
3. Identifique cada fórmula distinta no texto
4. Para cada fórmula, extraia nome/indicação e todos os ativos

FORMATO OBRIGATÓRIO - retorne APENAS este JSON:
[
  {
    "name": "Nome ou Indicação da Fórmula",
    "category": "categoria estimada",
    "pharmaceutical_form": "cápsulas|óvulos|pomada|sabonete|creme|sachê",
    "specialty": "ginecologia|urologia|endocrinologia|geral",
    "clinical_indication": "indicação clínica",
    "actives": [
      {
        "name": "Nome do Ativo",
        "concentration_mg": 1000,
        "concentration_text": "1 bilhão"
      }
    ]
  }
]

TEXTO PARA ANÁLISE:
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
              // Tentar extrair manualmente
              try {
                const manualFormulas = extractFormulasManually(chunk);
                if (manualFormulas.length > 0) {
                  console.log(`Extração manual da seção ${i + 1}: ${manualFormulas.length} fórmulas`);
                  allFormulas.push(...manualFormulas);
                }
              } catch (manualError) {
                console.error(`Extração manual falhou na seção ${i + 1}:`, manualError);
              }
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

  const extractFormulasManually = (text: string): ExtractedFormula[] => {
    const formulas: ExtractedFormula[] = [];
    
    // Dividir por seções baseadas em indicações
    const sections = text.split(/(?=Tratamento|TPM|Libido|Óvulos|Pomada|Sabonete|CREME|DISFUNÇÃO)/i);
    
    sections.forEach((section, index) => {
      if (section.trim().length < 20) return;
      
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length === 0) return;
      
      const formula: ExtractedFormula = {
        name: lines[0].trim() || `Fórmula ${index + 1}`,
        category: 'Geral',
        pharmaceutical_form: 'cápsulas',
        specialty: 'geral',
        clinical_indication: lines[0].trim(),
        actives: []
      };

      // Detectar forma farmacêutica
      const sectionLower = section.toLowerCase();
      if (sectionLower.includes('óvulo')) formula.pharmaceutical_form = 'óvulos';
      else if (sectionLower.includes('pomada')) formula.pharmaceutical_form = 'pomada';
      else if (sectionLower.includes('sabonete')) formula.pharmaceutical_form = 'sabonete';
      else if (sectionLower.includes('creme')) formula.pharmaceutical_form = 'creme';
      else if (sectionLower.includes('sachê')) formula.pharmaceutical_form = 'sachê';

      // Detectar especialidade
      if (sectionLower.includes('vagina') || sectionLower.includes('óvulo')) formula.specialty = 'ginecologia';
      else if (sectionLower.includes('libido') || sectionLower.includes('eret')) formula.specialty = 'urologia';
      else if (sectionLower.includes('tpm')) formula.specialty = 'endocrinologia';

      // Extrair ativos
      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.includes('Tomar') || cleanLine.includes('Aplicar')) return;
        
        // Padrões para identificar ativos com concentrações
        const patterns = [
          /(.+?)\s+(\d+(?:\.\d+)?)\s*(?:bilhão|bilhões)/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*(?:blh)/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*mg/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*mcg/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*UI/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*%/i
        ];
        
        for (const pattern of patterns) {
          const match = cleanLine.match(pattern);
          if (match) {
            let name = match[1].trim();
            const value = parseFloat(match[2]);
            
            // Limpar nome do ativo
            name = name.replace(/^[-•]\s*/, '').trim();
            
            if (name.length < 3) continue; // Ignorar nomes muito curtos
            
            // Converter concentrações
            let concentration_mg = value;
            if (cleanLine.toLowerCase().includes('bilhão') || cleanLine.toLowerCase().includes('blh')) {
              concentration_mg = value * 1000;
            } else if (cleanLine.toLowerCase().includes('mcg')) {
              concentration_mg = value / 1000;
            } else if (cleanLine.toLowerCase().includes('%')) {
              concentration_mg = value * 100; // Estimativa para percentuais
            }
            
            formula.actives.push({
              name,
              concentration_mg,
              concentration_text: match[0].trim(),
              role: null
            });
            break;
          }
        }
      });
      
      if (formula.actives.length > 0) {
        formulas.push(formula);
      }
    });
    
    return formulas;
  };

  const parseAIResponse = (responseText: string): ExtractedFormula[] => {
    console.log('Tentando extrair JSON da resposta...');

    // Múltiplas estratégias para encontrar JSON
    let jsonText = '';
    
    // 1. Procurar por array JSON
    const arrayMatch = responseText.match(/\[[\s\S]*?\]/);
    if (arrayMatch) {
      jsonText = arrayMatch[0];
    } else {
      // 2. Procurar por objeto JSON único
      const objectMatch = responseText.match(/\{[\s\S]*?\}/);
      if (objectMatch) {
        jsonText = `[${objectMatch[0]}]`; // Transformar em array
      }
    }

    if (!jsonText) {
      throw new Error('Nenhum JSON encontrado na resposta');
    }

    // Limpeza agressiva do JSON
    jsonText = jsonText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remover caracteres de controle
      .replace(/,(\s*[}\]])/g, '$1') // Remover vírgulas antes de } ou ]
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Aspas nas chaves
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Aspas simples para duplas
      .replace(/\n/g, ' ') // Remover quebras
      .replace(/\t/g, ' ') // Remover tabs
      .replace(/\s+/g, ' ') // Múltiplos espaços
      .replace(/,\s*}/g, '}') // Vírgula antes de }
      .replace(/,\s*]/g, ']') // Vírgula antes de ]
      .trim();

    try {
      const parsedData = JSON.parse(jsonText);
      let formulasArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      // Validar e limpar fórmulas
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
              Cole o texto com as fórmulas (prescrições, protocolos, etc.)
            </Label>
            <Textarea
              id="formula-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui o texto com as fórmulas... 

O sistema irá dividir automaticamente textos longos em seções menores para melhor processamento."
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
              {isProcessing ? 'Processando...' : 'Extrair Fórmulas com IA'}
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
