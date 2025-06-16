
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
          message: `INSTRUÇÃO ESPECIAL PARA EXTRAÇÃO DE FÓRMULAS:

Analise o texto fornecido e extraia TODAS as fórmulas encontradas. Para cada fórmula, identifique:
- Nome/descrição da fórmula
- Categoria (ex: candidíase, TPM, libido, menopausa, etc)
- Forma farmacêutica (cápsulas, óvulos, pomada, xarope, etc)
- Especialidade médica
- Todos os ativos com suas concentrações

RETORNE APENAS UM JSON VÁLIDO neste formato exato:
{
  "formulas": [
    {
      "name": "nome da fórmula",
      "category": "categoria",
      "pharmaceutical_form": "forma farmacêutica",
      "specialty": "especialidade",
      "description": "descrição breve",
      "clinical_indication": "indicação clínica",
      "actives": [
        {
          "name": "nome do ativo",
          "concentration_mg": numero_em_mg,
          "concentration_text": "texto original",
          "role": "função do ativo"
        }
      ]
    }
  ]
}

REGRAS IMPORTANTES:
- Para concentrações em bilhões (ex: "1 bilhão"), converta para mg: 1 bilhão = 1000mg
- Para UI (unidades internacionais), mantenha o número: 2000 UI = 2000mg
- Para mcg, converta: 1000mcg = 1mg
- Para g, converta: 1g = 1000mg
- Para %, extraia o número: 10% = 10mg
- Se não conseguir converter, use 0 para concentration_mg
- Identifique bem a forma farmacêutica (cápsulas, óvulos, pomada, xarope, etc)
- Agrupe ativos que fazem parte da mesma fórmula

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

      // Tentar extrair JSON da resposta, sendo mais flexível
      let jsonText = data.response;
      
      // Procurar por JSON válido na resposta
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('JSON não encontrado na resposta:', jsonText);
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
        throw new Error('Erro ao interpretar resposta da IA. Tente novamente.');
      }
      
      if (!extractedData.formulas || !Array.isArray(extractedData.formulas)) {
        console.error('Estrutura inválida:', extractedData);
        throw new Error('Estrutura de resposta inválida - propriedade "formulas" não encontrada');
      }

      // Validar e limpar dados das fórmulas
      const validFormulas = extractedData.formulas.map((formula: any, index: number) => {
        if (!formula.name || !formula.actives || !Array.isArray(formula.actives)) {
          console.warn(`Fórmula ${index} inválida:`, formula);
          return null;
        }

        // Validar e limpar ativos
        const validActives = formula.actives.map((active: any) => {
          return {
            name: active.name || 'Ativo sem nome',
            concentration_mg: typeof active.concentration_mg === 'number' ? active.concentration_mg : 0,
            concentration_text: active.concentration_text || active.name || '',
            role: active.role || null
          };
        }).filter((active: any) => active.name && active.name !== 'Ativo sem nome');

        if (validActives.length === 0) {
          console.warn(`Fórmula ${index} sem ativos válidos:`, formula);
          return null;
        }

        return {
          name: formula.name,
          category: formula.category || 'Geral',
          pharmaceutical_form: formula.pharmaceutical_form || 'Cápsulas',
          specialty: formula.specialty || 'Medicina Geral',
          description: formula.description || null,
          clinical_indication: formula.clinical_indication || null,
          actives: validActives
        };
      }).filter(Boolean);

      if (validFormulas.length === 0) {
        throw new Error('Nenhuma fórmula válida encontrada no texto');
      }

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

    try {
      for (const formula of extractedFormulas) {
        console.log('Salvando fórmula:', formula.name);
        
        // Validar dados antes de inserir
        if (!formula.name || !formula.actives || formula.actives.length === 0) {
          console.warn('Fórmula inválida pulada:', formula);
          continue;
        }

        // Inserir fórmula
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

        console.log('Dados da fórmula para inserção:', formulaData);

        const { data: insertedFormula, error: formulaError } = await supabase
          .from('reference_formulas')
          .insert(formulaData)
          .select()
          .single();

        if (formulaError) {
          console.error('Erro ao inserir fórmula:', formulaError);
          throw new Error(`Erro ao salvar fórmula "${formula.name}": ${formulaError.message}`);
        }

        if (!insertedFormula) {
          throw new Error(`Fórmula "${formula.name}" não foi salva corretamente`);
        }

        console.log('Fórmula salva com ID:', insertedFormula.id);

        // Inserir ativos da fórmula
        for (const active of formula.actives) {
          if (!active.name) {
            console.warn('Ativo sem nome pulado:', active);
            continue;
          }

          const activeData = {
            formula_id: insertedFormula.id,
            active_name: active.name,
            concentration_mg: active.concentration_mg || 0,
            concentration_text: active.concentration_text || active.name,
            role_in_formula: active.role
          };

          console.log('Dados do ativo para inserção:', activeData);

          const { error: activeError } = await supabase
            .from('reference_formula_actives')
            .insert(activeData);

          if (activeError) {
            console.error('Erro ao inserir ativo:', activeError);
            throw new Error(`Erro ao salvar ativo "${active.name}": ${activeError.message}`);
          }
        }

        savedCount++;
      }

      toast({
        title: "Fórmulas salvas!",
        description: `${savedCount} fórmula(s) adicionada(s) ao banco de dados.`,
      });

      // Limpar dados
      setExtractedFormulas([]);
      setInputText('');

    } catch (error: any) {
      console.error('Erro detalhado ao salvar fórmulas:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar fórmulas no banco de dados.",
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
