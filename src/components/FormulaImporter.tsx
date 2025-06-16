
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
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `INSTRUÇÃO ESPECIAL: Analise o texto abaixo e extraia TODAS as fórmulas encontradas. Para cada fórmula, retorne um JSON válido com a estrutura exata:

{
  "formulas": [
    {
      "name": "Nome da fórmula ou descrição",
      "category": "categoria (ex: performance, emagrecimento, antienvelhecimento, etc)",
      "pharmaceutical_form": "forma farmacêutica (ex: cápsulas, gel, creme, etc)",
      "specialty": "especialidade médica (ex: endocrinologia, dermatologia, medicina esportiva, etc)",
      "description": "descrição breve da fórmula",
      "clinical_indication": "indicação clínica",
      "actives": [
        {
          "name": "nome do ativo",
          "concentration_mg": número_em_mg,
          "concentration_text": "texto original da concentração",
          "role": "função do ativo na fórmula"
        }
      ]
    }
  ]
}

REGRAS IMPORTANTES:
- Extraia concentrações em mg sempre que possível
- Se a concentração estiver em outras unidades (g, mcg, UI, %), converta para mg ou mantenha o texto original
- Identifique todos os ativos e suas concentrações
- Determine categorias apropriadas baseadas no uso clínico
- Retorne APENAS o JSON, sem texto adicional

TEXTO A ANALISAR:
${inputText}`,
          specialty: 'geral'
        }
      });

      if (error || !data?.response) {
        throw new Error('Erro ao processar fórmulas');
      }

      // Tentar extrair JSON da resposta
      let jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      
      if (extractedData.formulas && Array.isArray(extractedData.formulas)) {
        setExtractedFormulas(extractedData.formulas);
        toast({
          title: "Fórmulas extraídas!",
          description: `${extractedData.formulas.length} fórmula(s) identificada(s) no texto.`,
        });
      } else {
        throw new Error('Nenhuma fórmula encontrada no formato válido');
      }

    } catch (error: any) {
      console.error('Erro ao extrair fórmulas:', error);
      toast({
        title: "Erro na extração",
        description: "Não foi possível extrair as fórmulas. Verifique o formato do texto.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveFormulasToDatabase = async () => {
    if (extractedFormulas.length === 0) return;

    try {
      for (const formula of extractedFormulas) {
        // Inserir fórmula
        const { data: formulaData, error: formulaError } = await supabase
          .from('reference_formulas')
          .insert({
            name: formula.name,
            category: formula.category,
            pharmaceutical_form: formula.pharmaceutical_form,
            specialty: formula.specialty,
            description: formula.description,
            clinical_indication: formula.clinical_indication,
            target_dosage_per_day: 1,
            capsules_per_dose: 1
          })
          .select()
          .single();

        if (formulaError) throw formulaError;

        // Inserir ativos da fórmula
        for (const active of formula.actives) {
          const { error: activeError } = await supabase
            .from('reference_formula_actives')
            .insert({
              formula_id: formulaData.id,
              active_name: active.name,
              concentration_mg: active.concentration_mg,
              concentration_text: active.concentration_text,
              role_in_formula: active.role
            });

          if (activeError) throw activeError;
        }
      }

      toast({
        title: "Fórmulas salvas!",
        description: `${extractedFormulas.length} fórmula(s) adicionada(s) ao banco de dados.`,
      });

      // Limpar dados
      setExtractedFormulas([]);
      setInputText('');

    } catch (error: any) {
      console.error('Erro ao salvar fórmulas:', error);
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar fórmulas no banco de dados.",
        variant: "destructive"
      });
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
Fórmula para Performance:
- Creatina 3g
- Beta-alanina 2g  
- Arginina 1g
- Cafeína 200mg

Protocolo Antienvelhecimento:
- Resveratrol 100mg
- Coenzima Q10 100mg
- Ácido hialurônico 50mg"
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
                        <h4 className="font-medium mb-2">Ativos:</h4>
                        <div className="grid gap-2">
                          {formula.actives.map((active, activeIndex) => (
                            <div key={activeIndex} className="bg-slate-50 p-2 rounded text-sm">
                              <span className="font-medium">{active.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {active.concentration_text} ({active.concentration_mg}mg)
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
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar {extractedFormulas.length} Fórmula(s) no Banco
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
              <SelectItem value="gel">Gel</SelectItem>
              <SelectItem value="creme">Creme</SelectItem>
              <SelectItem value="solução">Solução</SelectItem>
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
              <SelectItem value="endocrinologia">Endocrinologia</SelectItem>
              <SelectItem value="dermatologia">Dermatologia</SelectItem>
              <SelectItem value="medicina esportiva">Medicina Esportiva</SelectItem>
              <SelectItem value="ginecologia">Ginecologia</SelectItem>
              <SelectItem value="urologia">Urologia</SelectItem>
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
