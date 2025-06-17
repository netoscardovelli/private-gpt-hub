import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Wand2, Check, X, Edit } from 'lucide-react';

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
      console.log('Enviando texto para análise...');
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Você é um extrator de fórmulas magistrais. Analise o texto e extraia TODAS as fórmulas encontradas.

CONVERSÕES OBRIGATÓRIAS:
- 1 bilhão = 1000
- 2 bilhões = 2000  
- 1000mcg = 1
- 1g = 1000
- Para %, calcule baseado no total: 10% de 40g = 4000
- Para UI, mantenha o número
- Se não conseguir converter, use 0

RETORNE APENAS JSON VÁLIDO sem explicações:

{
  "formulas": [
    {
      "name": "Nome da fórmula",
      "category": "ginecologia",
      "pharmaceutical_form": "cápsulas",
      "specialty": "ginecologia", 
      "description": "Descrição",
      "clinical_indication": "Indicação",
      "actives": [
        {
          "name": "Nome do ativo",
          "concentration_mg": 1000,
          "concentration_text": "1 bilhão",
          "role": "probiótico"
        }
      ]
    }
  ]
}

Texto: ${inputText}`,
          specialty: 'geral'
        }
      });

      console.log('Resposta recebida:', data);

      if (error) {
        console.error('Erro na API:', error);
        throw new Error(`Erro na API: ${error.message}`);
      }

      if (!data?.response) {
        throw new Error('Resposta vazia da API');
      }

      let responseText = data.response.trim();
      console.log('Resposta da IA (primeiros 500 chars):', responseText.substring(0, 500));

      // Remover texto antes e depois do JSON
      let jsonStart = responseText.indexOf('{');
      let jsonEnd = responseText.lastIndexOf('}');
      
      // Se não encontrar { }, tentar procurar por ```json
      if (jsonStart === -1) {
        const jsonBlockStart = responseText.indexOf('```json');
        if (jsonBlockStart !== -1) {
          jsonStart = responseText.indexOf('{', jsonBlockStart);
          const jsonBlockEnd = responseText.indexOf('```', jsonBlockStart + 7);
          if (jsonBlockEnd !== -1) {
            jsonEnd = responseText.lastIndexOf('}', jsonBlockEnd);
          }
        }
      }
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
        console.error('JSON não encontrado na resposta:', responseText);
        throw new Error('Formato de resposta inválido - JSON não encontrado');
      }

      const jsonText = responseText.substring(jsonStart, jsonEnd + 1);
      console.log('JSON extraído:', jsonText);

      let extractedData;
      try {
        extractedData = JSON.parse(jsonText);
        console.log('JSON parseado com sucesso:', extractedData);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        console.error('JSON problemático:', jsonText);
        
        // Tentar limpar o JSON
        try {
          let cleanedJson = jsonText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
            .replace(/,(\s*[}\]])/g, '$1') // Remove vírgulas antes de } e ]
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Adiciona aspas em chaves sem aspas
            .replace(/:\s*'([^']*)'/g, ': "$1"') // Converte aspas simples para duplas
            .replace(/\\'/g, "'"); // Remove escapes desnecessários
          
          extractedData = JSON.parse(cleanedJson);
          console.log('JSON limpo e parseado:', extractedData);
        } catch (secondError) {
          console.error('Erro no segundo parse:', secondError);
          throw new Error('Não foi possível interpretar a resposta da IA. Tente com um texto menor ou reformulado.');
        }
      }
      
      if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('Resposta da IA não é um objeto válido');
      }

      if (!extractedData.formulas || !Array.isArray(extractedData.formulas)) {
        console.error('Estrutura inválida - formulas não é array:', extractedData);
        throw new Error('Estrutura de resposta inválida - propriedade "formulas" não encontrada');
      }

      // Validar e processar fórmulas
      const validFormulas = extractedData.formulas
        .map((formula: any, index: number) => {
          console.log(`Validando fórmula ${index}:`, formula);
          
          if (!formula || typeof formula !== 'object') {
            console.warn(`Fórmula ${index} não é um objeto válido:`, formula);
            return null;
          }

          if (!formula.name || typeof formula.name !== 'string' || !formula.name.trim()) {
            console.warn(`Fórmula ${index} sem nome válido:`, formula);
            return null;
          }

          if (!formula.actives || !Array.isArray(formula.actives) || formula.actives.length === 0) {
            console.warn(`Fórmula ${index} sem ativos válidos:`, formula);
            return null;
          }

          // Processar ativos
          const validActives = formula.actives
            .map((active: any, activeIndex: number) => {
              if (!active || typeof active !== 'object') {
                console.warn(`Ativo ${activeIndex} da fórmula ${index} não é objeto:`, active);
                return null;
              }

              if (!active.name || typeof active.name !== 'string' || !active.name.trim()) {
                console.warn(`Ativo ${activeIndex} da fórmula ${index} sem nome:`, active);
                return null;
              }
              
              const concentrationMg = typeof active.concentration_mg === 'number' && !isNaN(active.concentration_mg) 
                ? Math.max(0, active.concentration_mg) 
                : 0;

              return {
                name: active.name.trim(),
                concentration_mg: concentrationMg,
                concentration_text: active.concentration_text || active.name.trim(),
                role: active.role || null
              };
            })
            .filter(Boolean);

          if (validActives.length === 0) {
            console.warn(`Fórmula ${index} sem ativos válidos após processamento`);
            return null;
          }

          return {
            name: formula.name.trim(),
            category: (formula.category || 'Geral').trim(),
            pharmaceutical_form: (formula.pharmaceutical_form || 'Cápsulas').trim(),
            specialty: (formula.specialty || 'Medicina Geral').trim(),
            description: formula.description ? formula.description.trim() : null,
            clinical_indication: formula.clinical_indication ? formula.clinical_indication.trim() : null,
            actives: validActives
          };
        })
        .filter(Boolean);

      console.log(`Processamento concluído: ${validFormulas.length} fórmulas válidas de ${extractedData.formulas.length} tentativas`);

      if (validFormulas.length === 0) {
        throw new Error('Nenhuma fórmula válida foi encontrada no texto. Verifique se o formato está correto.');
      }

      setExtractedFormulas(validFormulas);
      
      toast({
        title: "Fórmulas extraídas!",
        description: `${validFormulas.length} fórmula(s) identificada(s) no texto.`,
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

  const saveFormulasToDatabase = async () => {
    if (extractedFormulas.length === 0) return;

    setIsProcessing(true);
    let savedCount = 0;
    const errors: string[] = [];

    try {
      for (const [index, formula] of extractedFormulas.entries()) {
        try {
          console.log(`Salvando fórmula ${index + 1}:`, formula.name);
          
          // Validar fórmula antes de salvar
          if (!formula.name?.trim()) {
            errors.push(`Fórmula ${index + 1}: Nome inválido`);
            continue;
          }

          if (!formula.actives || formula.actives.length === 0) {
            errors.push(`Fórmula ${index + 1}: Sem ativos válidos`);
            continue;
          }

          // Inserir fórmula
          const formulaData = {
            name: formula.name.trim(),
            category: formula.category || 'Geral',
            pharmaceutical_form: formula.pharmaceutical_form || 'Cápsulas',
            specialty: formula.specialty || 'Medicina Geral',
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

          // Inserir ativos
          const activesToInsert = formula.actives
            .filter(active => active.name?.trim())
            .map(active => ({
              formula_id: insertedFormula.id,
              active_name: active.name.trim(),
              concentration_mg: Math.max(0, active.concentration_mg || 0),
              concentration_text: active.concentration_text || active.name.trim(),
              role_in_formula: active.role
            }));

          if (activesToInsert.length === 0) {
            errors.push(`Fórmula "${formula.name}": Nenhum ativo válido para inserir`);
            continue;
          }

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

      // Mostrar resultado
      if (savedCount > 0) {
        toast({
          title: "Fórmulas salvas!",
          description: `${savedCount} fórmula(s) adicionada(s) ao banco de dados.`,
        });

        // Limpar apenas se salvou alguma
        setExtractedFormulas([]);
        setInputText('');
      }

      if (errors.length > 0) {
        console.error('Erros durante o salvamento:', errors);
        toast({
          title: errors.length === extractedFormulas.length ? "Erro ao salvar" : "Salvamento parcial",
          description: `${errors.length} erro(s) encontrado(s). Verifique o console para detalhes.`,
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

Exemplo:
Tratamento para Candidíase
Lactobacillus Rhamnosus 1 bilhão
Lactobacillus Acidophilus 1 bilhão
Fos 300 mg
Tomar 1 dose à noite"
              className="min-h-[200px]"
            />
          </div>
          
          <Button 
            onClick={extractFormulasWithAI}
            disabled={!inputText.trim() || isProcessing}
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processando...' : 'Extrair Fórmulas com IA'}
          </Button>
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
