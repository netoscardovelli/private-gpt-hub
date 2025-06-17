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
          message: `Extraia TODAS as fórmulas do texto e retorne APENAS um JSON válido:

CONVERSÕES IMPORTANTES:
- 1 bilhão = 1000
- 2 bilhões = 2000  
- 1000mcg = 1
- 1g = 1000
- Para %, calcule: 10% = 10000, 1% = 1000, 0,1% = 100, 7,5% = 7500
- UI: mantenha o número original

RETORNE APENAS:
[
  {
    "name": "Tratamento Candidíase 1",
    "category": "ginecologia",
    "pharmaceutical_form": "cápsulas",
    "specialty": "ginecologia",
    "description": "",
    "clinical_indication": "Tratamento candidíase",
    "actives": [
      {"name": "Lactobacillus Rhamnosus", "concentration_mg": 1000, "concentration_text": "1 bilhão"},
      {"name": "FOS", "concentration_mg": 300, "concentration_text": "300mg"}
    ]
  }
]

TEXTO: ${inputText}`,
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
      console.log('Resposta completa da IA:', responseText);

      // Procurar por array JSON
      let arrayStart = responseText.indexOf('[');
      let arrayEnd = responseText.lastIndexOf(']');
      
      if (arrayStart === -1 || arrayEnd === -1) {
        // Tentar procurar por objeto com propriedade formulas
        arrayStart = responseText.indexOf('{');
        arrayEnd = responseText.lastIndexOf('}');
        
        if (arrayStart === -1 || arrayEnd === -1) {
          throw new Error('Nenhum JSON encontrado na resposta');
        }
      }
      
      const jsonText = responseText.substring(arrayStart, arrayEnd + 1);
      console.log('JSON extraído:', jsonText);

      let extractedData;
      try {
        extractedData = JSON.parse(jsonText);
        console.log('JSON parseado:', extractedData);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        
        // Tentar limpar JSON comum
        const cleanedJson = jsonText
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          .replace(/:\s*'([^']*)'/g, ': "$1"')
          .replace(/\n/g, ' ')
          .replace(/\t/g, ' ');
        
        try {
          extractedData = JSON.parse(cleanedJson);
          console.log('JSON limpo parseado:', extractedData);
        } catch (secondError) {
          console.error('Erro no segundo parse:', secondError);
          throw new Error('Não foi possível interpretar a resposta. Tente novamente.');
        }
      }
      
      // Verificar se é array ou objeto com propriedade formulas
      let formulasArray;
      if (Array.isArray(extractedData)) {
        formulasArray = extractedData;
      } else if (extractedData.formulas && Array.isArray(extractedData.formulas)) {
        formulasArray = extractedData.formulas;
      } else {
        throw new Error('Formato de resposta inválido');
      }

      // Validar e processar fórmulas
      const validFormulas = formulasArray
        .map((formula: any, index: number) => {
          if (!formula || !formula.name || !formula.actives || !Array.isArray(formula.actives)) {
            console.warn(`Fórmula ${index} inválida:`, formula);
            return null;
          }

          const validActives = formula.actives
            .filter((active: any) => active && active.name)
            .map((active: any) => ({
              name: String(active.name).trim(),
              concentration_mg: Number(active.concentration_mg) || 0,
              concentration_text: String(active.concentration_text || active.name).trim(),
              role: active.role || null
            }));

          if (validActives.length === 0) {
            console.warn(`Fórmula ${index} sem ativos válidos`);
            return null;
          }

          return {
            name: String(formula.name).trim(),
            category: String(formula.category || 'Geral').trim(),
            pharmaceutical_form: String(formula.pharmaceutical_form || 'Cápsulas').trim(),
            specialty: String(formula.specialty || 'Medicina Geral').trim(),
            description: formula.description ? String(formula.description).trim() : null,
            clinical_indication: formula.clinical_indication ? String(formula.clinical_indication).trim() : null,
            actives: validActives
          };
        })
        .filter(Boolean);

      console.log(`Processamento concluído: ${validFormulas.length} fórmulas válidas`);

      if (validFormulas.length === 0) {
        throw new Error('Nenhuma fórmula válida foi encontrada. Verifique o formato do texto.');
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
