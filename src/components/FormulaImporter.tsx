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

  const parseAIResponse = (responseText: string): ExtractedFormula[] => {
    console.log('Resposta bruta da IA:', responseText);

    // Tentar encontrar JSON válido na resposta
    let jsonText = '';
    
    // Procurar por array JSON primeiro
    const arrayMatch = responseText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonText = arrayMatch[0];
    } else {
      // Procurar por objeto JSON
      const objectMatch = responseText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonText = objectMatch[0];
      } else {
        throw new Error('Nenhum JSON encontrado na resposta da IA');
      }
    }

    console.log('JSON extraído:', jsonText);

    // Limpar JSON comum
    const cleanedJson = jsonText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
      .replace(/,(\s*[}\]])/g, '$1') // Remove vírgulas antes de } ou ]
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Adiciona aspas nas chaves
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Converte aspas simples em duplas
      .replace(/\n/g, ' ') // Remove quebras de linha
      .replace(/\t/g, ' ') // Remove tabs
      .replace(/\s+/g, ' ') // Múltiplos espaços em um só
      .trim();

    console.log('JSON limpo:', cleanedJson);

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Erro no parse do JSON limpo:', parseError);
      
      // Último recurso: tentar extrair dados manualmente
      try {
        parsedData = extractDataManually(responseText);
      } catch (manualError) {
        console.error('Erro na extração manual:', manualError);
        throw new Error('Não foi possível interpretar a resposta da IA. Tente novamente com um texto menor ou mais estruturado.');
      }
    }

    // Processar dados extraídos
    let formulasArray: any[] = [];
    
    if (Array.isArray(parsedData)) {
      formulasArray = parsedData;
    } else if (parsedData.formulas && Array.isArray(parsedData.formulas)) {
      formulasArray = parsedData.formulas;
    } else if (typeof parsedData === 'object') {
      // Se for um objeto único, transformar em array
      formulasArray = [parsedData];
    }

    if (formulasArray.length === 0) {
      throw new Error('Nenhuma fórmula válida encontrada na resposta');
    }

    // Validar e processar cada fórmula
    const validFormulas: ExtractedFormula[] = formulasArray
      .map((formula, index) => {
        try {
          if (!formula || typeof formula !== 'object') {
            console.warn(`Fórmula ${index} não é um objeto válido:`, formula);
            return null;
          }

          const name = String(formula.name || formula.titulo || `Fórmula ${index + 1}`).trim();
          const actives = Array.isArray(formula.actives) ? formula.actives : 
                         Array.isArray(formula.ativos) ? formula.ativos : [];

          if (actives.length === 0) {
            console.warn(`Fórmula ${index} sem ativos válidos`);
            return null;
          }

          const validActives = actives
            .filter((active: any) => active && (active.name || active.nome))
            .map((active: any) => ({
              name: String(active.name || active.nome).trim(),
              concentration_mg: Number(active.concentration_mg || active.concentracao_mg || 0),
              concentration_text: String(active.concentration_text || active.concentracao_texto || active.name || active.nome).trim(),
              role: active.role || active.funcao || null
            }));

          if (validActives.length === 0) {
            console.warn(`Fórmula ${index} sem ativos válidos após processamento`);
            return null;
          }

          return {
            name,
            category: String(formula.category || formula.categoria || 'Geral').trim(),
            pharmaceutical_form: String(formula.pharmaceutical_form || formula.forma_farmaceutica || 'Cápsulas').trim(),
            specialty: String(formula.specialty || formula.especialidade || 'Medicina Geral').trim(),
            description: formula.description || formula.descricao || null,
            clinical_indication: formula.clinical_indication || formula.indicacao_clinica || null,
            actives: validActives
          };
        } catch (formulaError) {
          console.error(`Erro ao processar fórmula ${index}:`, formulaError);
          return null;
        }
      })
      .filter(Boolean) as ExtractedFormula[];

    if (validFormulas.length === 0) {
      throw new Error('Nenhuma fórmula válida foi processada');
    }

    return validFormulas;
  };

  const extractDataManually = (text: string): any[] => {
    // Método de backup para extrair dados manualmente quando JSON falha
    const formulas: any[] = [];
    
    // Dividir o texto em seções por fórmulas
    const sections = text.split(/(?=\w+.*?:)/);
    
    sections.forEach((section, index) => {
      if (section.trim().length < 10) return;
      
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length === 0) return;
      
      const formula: any = {
        name: `Fórmula Extraída ${index + 1}`,
        category: 'Geral',
        pharmaceutical_form: 'Cápsulas',
        specialty: 'Medicina Geral',
        actives: []
      };
      
      // Tentar extrair nome da primeira linha
      if (lines[0] && !lines[0].toLowerCase().includes('mg') && !lines[0].toLowerCase().includes('bilhão')) {
        formula.name = lines[0].trim();
      }
      
      // Extrair ativos das linhas
      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        
        // Padrões para identificar ativos
        const patterns = [
          /(.+?)\s+(\d+(?:\.\d+)?)\s*(?:bilhão|billion)/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*mg/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*mcg/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*UI/i,
          /(.+?)\s+(\d+(?:\.\d+)?)\s*%/i
        ];
        
        for (const pattern of patterns) {
          const match = cleanLine.match(pattern);
          if (match) {
            const name = match[1].trim();
            const value = parseFloat(match[2]);
            
            // Converter bilhões para mg
            let concentration_mg = value;
            if (cleanLine.toLowerCase().includes('bilhão')) {
              concentration_mg = value * 1000;
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
          message: `Analise este texto e extraia as fórmulas farmacêuticas. Retorne APENAS um array JSON válido.

REGRAS DE CONVERSÃO:
- 1 bilhão = 1000mg
- 2 bilhões = 2000mg  
- 1000mcg = 1mg
- 1g = 1000mg
- Para %: 10% = 10000mg, 1% = 1000mg, 0,1% = 100mg

FORMATO DE RESPOSTA (retorne apenas o JSON):
[
  {
    "name": "Nome da Fórmula",
    "category": "categoria",
    "pharmaceutical_form": "cápsulas",
    "specialty": "especialidade",
    "description": "descrição opcional",
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

      const validFormulas = parseAIResponse(data.response);
      
      console.log(`Processamento concluído: ${validFormulas.length} fórmulas válidas`);

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
