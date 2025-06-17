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
      console.log('Enviando texto para análise:', inputText.substring(0, 200) + '...');
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `SISTEMA DE EXTRAÇÃO DE FÓRMULAS MAGISTRAIS:

Analise o texto fornecido e extraia TODAS as fórmulas encontradas. Identifique:

1. NOME/OBJETIVO da fórmula (ex: "Candidíase", "TPM", "Libido Masculina", etc)
2. FORMA FARMACÊUTICA (cápsulas, óvulos, pomada, creme, xarope, sachê, etc)
3. CATEGORIA/ÁREA (ginecologia, urologia, dermatologia, etc)
4. TODOS OS ATIVOS com suas concentrações exatas

CONVERSÕES OBRIGATÓRIAS:
- 1 bilhão = 1000mg
- 2 bilhões = 2000mg  
- 1000mcg = 1mg
- 1g = 1000mg
- Para % (ex: 10%), use valor numérico: 10mg
- Para UI, mantenha o número: 2000 UI = 2000mg
- Se não conseguir converter, use 0

RETORNE APENAS JSON VÁLIDO:
{
  "formulas": [
    {
      "name": "Nome da fórmula",
      "category": "categoria médica",
      "pharmaceutical_form": "forma farmacêutica",
      "specialty": "especialidade médica",
      "description": "descrição breve",
      "clinical_indication": "indicação clínica",
      "actives": [
        {
          "name": "nome do ativo",
          "concentration_mg": numero_em_mg,
          "concentration_text": "texto original da concentração",
          "role": "função do ativo (opcional)"
        }
      ]
    }
  ]
}

INSTRUÇÕES ESPECÍFICAS:
- Para fórmulas sem nome claro, use o objetivo (ex: "Fórmula para Candidíase")
- Agrupe ativos que pertencem à mesma fórmula
- Identifique corretamente a forma farmacêutica (óvulos, pomadas, cápsulas, etc)
- Para especialidades, use: ginecologia, urologia, dermatologia, endocrinologia, medicina geral
- Mantenha o texto original da concentração em "concentration_text"

TEXTO PARA ANÁLISE:
${inputText}`,
          specialty: 'geral'
        }
      });

      console.log('Resposta da IA:', data);

      if (error) {
        console.error('Erro na chamada da API:', error);
        throw new Error('Erro ao processar fórmulas: ' + error.message);
      }

      if (!data?.response) {
        throw new Error('Resposta vazia da API');
      }

      // Extrair JSON de forma mais robusta
      let jsonText = data.response.trim();
      console.log('Resposta completa:', jsonText);

      // Remover texto antes e depois do JSON
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('JSON não encontrado na resposta');
        throw new Error('Formato de resposta inválido - JSON não encontrado');
      }

      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      console.log('JSON extraído:', jsonText);

      let extractedData;
      try {
        extractedData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        console.error('JSON problemático:', jsonText);
        
        // Tentar limpar e parsear novamente
        try {
          const cleanedJson = jsonText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
            .replace(/,\s*}/g, '}') // Remove vírgulas antes de }
            .replace(/,\s*]/g, ']'); // Remove vírgulas antes de ]
          
          extractedData = JSON.parse(cleanedJson);
          console.log('JSON limpo e parseado com sucesso');
        } catch (secondError) {
          throw new Error('Erro ao interpretar resposta da IA. Tente novamente.');
        }
      }
      
      if (!extractedData.formulas || !Array.isArray(extractedData.formulas)) {
        console.error('Estrutura inválida:', extractedData);
        throw new Error('Estrutura de resposta inválida');
      }

      // Validar e processar fórmulas
      const validFormulas = extractedData.formulas
        .map((formula: any, index: number) => {
          console.log(`Processando fórmula ${index}:`, formula);
          
          if (!formula.name || !formula.actives || !Array.isArray(formula.actives)) {
            console.warn(`Fórmula ${index} inválida:`, formula);
            return null;
          }

          // Processar ativos
          const validActives = formula.actives
            .map((active: any) => {
              if (!active.name) return null;
              
              return {
                name: active.name.trim(),
                concentration_mg: typeof active.concentration_mg === 'number' ? Math.max(0, active.concentration_mg) : 0,
                concentration_text: active.concentration_text || active.name || '',
                role: active.role || null
              };
            })
            .filter(Boolean);

          if (validActives.length === 0) {
            console.warn(`Fórmula ${index} sem ativos válidos`);
            return null;
          }

          return {
            name: formula.name.trim(),
            category: formula.category || 'Geral',
            pharmaceutical_form: formula.pharmaceutical_form || 'Cápsulas',
            specialty: formula.specialty || 'Medicina Geral',
            description: formula.description || null,
            clinical_indication: formula.clinical_indication || null,
            actives: validActives
          };
        })
        .filter(Boolean);

      if (validFormulas.length === 0) {
        throw new Error('Nenhuma fórmula válida encontrada no texto');
      }

      console.log('Fórmulas extraídas:', validFormulas);
      setExtractedFormulas(validFormulas);
      
      toast({
        title: "Fórmulas extraídas!",
        description: `${validFormulas.length} fórmula(s) identificada(s) no texto.`,
      });

    } catch (error: any) {
      console.error('Erro detalhado ao extrair fórmulas:', error);
      toast({
        title: "Erro na extração",
        description: error.message || "Não foi possível extrair as fórmulas. Verifique o formato do texto.",
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
Tomar 1 dose à noite

Fórmula para TPM
Vitex Agnus 300 mg
Ashwagandha 350 mg
Vit B6 35 mg
Tomar 1 dose 1 x ao dia"
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
