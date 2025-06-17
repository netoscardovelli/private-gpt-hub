
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickActiveAdderProps {
  onAddActive: (actives: any[]) => void;
  currentFormula: string;
  specialty: string;
}

const QuickActiveAdder = ({ onAddActive, currentFormula, specialty }: QuickActiveAdderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState('');
  const [dosage, setDosage] = useState('');
  const [showDosageInput, setShowDosageInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | ''>('');
  const [detectedFormulas, setDetectedFormulas] = useState<string[]>([]);
  const [selectedFormulaIndex, setSelectedFormulaIndex] = useState<number>(-1);
  const { toast } = useToast();

  // Detectar fórmulas na conversa atual
  const detectExistingFormulas = () => {
    console.log('🔍 Detectando fórmulas na conversa...');
    console.log('📝 Conteúdo recebido:', currentFormula.substring(0, 300));
    
    const formulas: string[] = [];
    
    // Padrões mais abrangentes para detectar fórmulas
    const formulaPatterns = [
      /\*\*Composição[:\s]*\*\*(.*?)(?=\*\*[^*]|\n\n)/gs,
      /\*\*COMPOSIÇÃO[:\s]*\*\*(.*?)(?=\*\*[^*]|\n\n)/gs,
      /Composição:(.*?)(?=\n\n|\*\*|$)/gs,
      /COMPOSIÇÃO:(.*?)(?=\n\n|\*\*|$)/gs,
      /📋\s*\*\*FÓRMULAS PRESCRITAS:\*\*(.*?)(?=\*\*[A-Z]|\n\n\*\*|$)/gs
    ];

    // Tentar cada padrão
    for (const pattern of formulaPatterns) {
      const matches = [...currentFormula.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[1].trim()) {
          const formulaContent = match[1].trim();
          // Verificar se tem dosagens típicas de fórmula
          if (formulaContent.includes('mg') || formulaContent.includes('mcg') || formulaContent.includes('UI')) {
            formulas.push(formulaContent);
          }
        }
      }
    }

    // Método alternativo: buscar por listas com bullets e dosagens
    const lines = currentFormula.split('\n');
    let currentFormulaText = '';
    let foundComposition = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar início de composição
      if (line.toLowerCase().includes('composição') || 
          line.toLowerCase().includes('fórmula') && line.includes('**')) {
        if (currentFormulaText && foundComposition) {
          formulas.push(currentFormulaText.trim());
        }
        currentFormulaText = '';
        foundComposition = true;
        continue;
      }
      
      // Se encontrou composição e tem item com dosagem
      if (foundComposition && line.startsWith('•') && 
          (line.includes('mg') || line.includes('mcg') || line.includes('UI'))) {
        currentFormulaText += line + '\n';
      }
      
      // Parar quando encontra nova seção
      if (foundComposition && line.startsWith('**') && 
          !line.toLowerCase().includes('composição') && 
          !line.toLowerCase().includes('fórmula')) {
        if (currentFormulaText.trim()) {
          formulas.push(currentFormulaText.trim());
          currentFormulaText = '';
        }
        foundComposition = false;
      }
    }
    
    // Adicionar última fórmula se houver
    if (currentFormulaText.trim() && foundComposition) {
      formulas.push(currentFormulaText.trim());
    }

    // Remover duplicatas
    const uniqueFormulas = [...new Set(formulas)];
    
    console.log('📋 Fórmulas detectadas:', uniqueFormulas.length);
    console.log('🔍 Fórmulas encontradas:', uniqueFormulas.map(f => f.substring(0, 100)));
    
    setDetectedFormulas(uniqueFormulas);
    return uniqueFormulas;
  };

  // Executar detecção quando componente carrega
  useEffect(() => {
    detectExistingFormulas();
  }, [currentFormula]);

  // Sugestões inteligentes baseadas na especialidade
  const getSmartSuggestions = () => {
    const suggestions: { name: string; reason: string; icon: string }[] = [];
    
    const formulaLower = currentFormula.toLowerCase();
    
    if (specialty === 'endocrinologia' || formulaLower.includes('emagrecimento') || formulaLower.includes('diabetes')) {
      suggestions.push(
        { name: 'Morosil', reason: 'Queima de gordura localizada', icon: '🔥' },
        { name: 'Berberina', reason: 'Sensibilidade à insulina', icon: '🎯' },
        { name: 'Picolinato de Cromo', reason: 'Controle glicêmico', icon: '📊' }
      );
    }

    if (formulaLower.includes('fibromialgia') || formulaLower.includes('dor')) {
      suggestions.push(
        { name: 'Curcumina', reason: 'Anti-inflamatório natural', icon: '🌿' },
        { name: 'Ômega 3', reason: 'Redução da inflamação', icon: '🐟' },
        { name: 'Vitamina D3', reason: 'Modulação da dor', icon: '☀️' }
      );
    }

    return suggestions.slice(0, 4);
  };

  const handleSelectActive = (activeName: string) => {
    setSelectedActive(activeName);
    setSearchTerm(activeName);
  };

  const handleContinue = () => {
    const activeToAdd = selectedActive || searchTerm.trim();
    
    if (!activeToAdd) {
      toast({
        title: "Digite um ativo",
        description: "Digite o nome do ativo que deseja adicionar",
        variant: "destructive"
      });
      return;
    }

    // Detectar fórmulas existentes
    const formulas = detectExistingFormulas();
    
    console.log('🎯 Fórmulas detectadas no continue:', formulas.length);
    
    if (formulas.length > 0) {
      // Se há fórmulas, mostrar opções
      console.log('✅ Mostrando opções de fórmulas existentes');
      setSelectedOption('');
      setShowDosageInput(false);
    } else {
      // Se não há fórmulas, ir direto para dosagem
      console.log('📝 Criando nova fórmula diretamente');
      setSelectedOption('new');
      setShowDosageInput(true);
    }
  };

  const handleOptionSelect = (option: 'existing' | 'new') => {
    console.log('🎯 Opção selecionada:', option);
    setSelectedOption(option);
    if (option === 'new') {
      setShowDosageInput(true);
    }
  };

  const handleFormulaSelect = (index: number) => {
    console.log('📋 Fórmula selecionada:', index);
    setSelectedFormulaIndex(index);
    setShowDosageInput(true);
  };

  const handleFinalAdd = () => {
    const activeToAdd = selectedActive || searchTerm.trim();
    
    if (!activeToAdd) {
      toast({
        title: "Erro",
        description: "Selecione um ativo",
        variant: "destructive"
      });
      return;
    }

    if (selectedOption === 'new' && !dosage.trim()) {
      toast({
        title: "Dosagem obrigatória",
        description: "Digite a dosagem para criar uma nova fórmula",
        variant: "destructive"
      });
      return;
    }

    // Criar objeto do ativo
    const newActive = {
      name: activeToAdd,
      concentration: dosage || 'A definir',
      benefit: 'Conforme análise clínica',
      mechanism: 'Revisar literatura',
      formulaIndex: selectedOption === 'existing' ? selectedFormulaIndex : -1,
      createNew: selectedOption === 'new'
    };

    console.log('🚀 Adicionando ativo:', newActive);

    // Chamar função de adicionar
    onAddActive([newActive]);
    
    toast({
      title: "Ativo adicionado!",
      description: `${activeToAdd} será incluído na análise`,
    });

    // Reset
    setSearchTerm('');
    setSelectedActive('');
    setDosage('');
    setShowDosageInput(false);
    setSelectedOption('');
    setSelectedFormulaIndex(-1);
  };

  const smartSuggestions = getSmartSuggestions();

  // Se não selecionou ativo ainda
  if (!selectedOption && detectedFormulas.length === 0 && !showDosageInput) {
    return (
      <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-200">
              Adicionar Ativo Esquecido
            </h4>
          </div>

          <div className="bg-slate-700/30 p-3 rounded-lg">
            <p className="text-xs text-slate-300">
              ✨ Escolha um ativo para adicionar. Como não foram detectadas fórmulas existentes, criaremos uma nova análise.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Digite o nome do ativo (ex: Oxandrolona, Morosil...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                  className="bg-slate-700 border-slate-600 text-white pl-10 text-sm"
                />
              </div>
            </div>
          </div>

          {smartSuggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Sugestões inteligentes</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {smartSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSelectActive(suggestion.name)}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 text-xs h-auto p-2 justify-start"
                  >
                    <span className="mr-2">{suggestion.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-xs text-blue-400">{suggestion.reason}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleContinue}
            disabled={!(selectedActive || searchTerm.trim())}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            Continuar com "{selectedActive || searchTerm}"
          </Button>
        </div>
      </Card>
    );
  }

  // Se detectou fórmulas e precisa escolher onde adicionar
  if (!selectedOption && detectedFormulas.length > 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-slate-200">
              Onde adicionar <span className="text-emerald-400">{selectedActive || searchTerm}</span>?
            </h4>
            <Badge className="bg-blue-600/30 text-blue-300 text-xs">
              {detectedFormulas.length} fórmula(s) detectada(s)
            </Badge>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleOptionSelect('existing')}
              variant="outline"
              className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/20 justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar a uma fórmula existente ({detectedFormulas.length} disponível(is))
            </Button>

            <Button
              onClick={() => handleOptionSelect('new')}
              variant="outline"
              className="w-full border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar nova fórmula com este ativo
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Se escolheu adicionar a fórmula existente
  if (selectedOption === 'existing' && !showDosageInput) {
    return (
      <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-slate-200">
              Escolha a fórmula para adicionar <span className="text-emerald-400">{selectedActive || searchTerm}</span>
            </h4>
          </div>

          <div className="space-y-2">
            {detectedFormulas.map((formula, index) => (
              <div
                key={index}
                className="p-3 rounded border border-slate-500 bg-slate-600/30 text-slate-300 hover:bg-slate-600/50 cursor-pointer transition-all"
                onClick={() => handleFormulaSelect(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Badge className="bg-blue-600/30 text-blue-300 text-xs mb-2">
                      Fórmula {index + 1}
                    </Badge>
                    <p className="text-xs">{formula.substring(0, 150)}...</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Se precisa de dosagem
  if (showDosageInput) {
    return (
      <Card className="bg-slate-800/50 border-slate-600 p-4 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-200">
              Definir dosagem para <span className="text-emerald-400">{selectedActive || searchTerm}</span>
            </h4>
          </div>

          <div className="bg-emerald-700/20 p-3 rounded-lg">
            <p className="text-xs text-emerald-300">
              {selectedOption === 'new' 
                ? '🆕 Criando nova fórmula - dosagem obrigatória'
                : `📋 Adicionando à fórmula ${selectedFormulaIndex + 1} - dosagem opcional`
              }
            </p>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Ex: 10mg, 500mcg, 2ui..."
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-sm"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleFinalAdd}
                disabled={selectedOption === 'new' && !dosage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                size="sm"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {selectedOption === 'new' ? 'Criar Nova Fórmula' : 'Adicionar à Fórmula'}
              </Button>
              
              <Button
                onClick={() => {
                  setShowDosageInput(false);
                  setSelectedOption('');
                  setSelectedFormulaIndex(-1);
                }}
                variant="outline"
                className="border-slate-500 text-slate-300"
                size="sm"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default QuickActiveAdder;
