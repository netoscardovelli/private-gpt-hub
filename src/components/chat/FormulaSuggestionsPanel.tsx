
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Send, Target } from 'lucide-react';

interface FormulaSuggestion {
  name: string;
  indication: string;
  composition: string[];
  category: string;
  description: string;
}

interface FormulaSuggestionsPanelProps {
  onClose: () => void;
  onSelectSuggestion: (suggestion: FormulaSuggestion) => void;
}

const FormulaSuggestionsPanel = ({ onClose, onSelectSuggestion }: FormulaSuggestionsPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const suggestions: FormulaSuggestion[] = [
    {
      name: "Fórmula Anti-Inflamatória",
      indication: "Dores crônicas e inflamação",
      composition: ["Curcumina 500mg", "Ômega 3 2000mg", "Resveratrol 250mg"],
      category: "anti-inflamatoria",
      description: "Combinação sinérgica para reduzir inflamação sistêmica"
    },
    {
      name: "Energia e Vitalidade",
      indication: "Fadiga crônica e baixa energia",
      composition: ["Coenzima Q10 200mg", "L-Carnitina 2000mg", "Vitamina D3 2000UI"],
      category: "energia",
      description: "Suporte energético mitocondrial e metabólico"
    },
    {
      name: "Relaxamento Muscular",
      indication: "Tensão muscular e fibromialgia",
      composition: ["Magnésio quelato 300mg", "Ácido málico 300mg", "5HTP 100mg"],
      category: "muscular",
      description: "Alívio da tensão muscular e melhora do sono"
    },
    {
      name: "Suporte Imunológico",
      indication: "Fortalecimento da imunidade",
      composition: ["Zinco quelato 30mg", "Vitamina D3 4000UI", "Ômega 3 1000mg"],
      category: "imunidade",
      description: "Reforço natural das defesas do organismo"
    },
    {
      name: "Controle Glicêmico",
      indication: "Diabetes tipo 2 e resistência insulínica",
      composition: ["Berberina 1500mg", "Picolinato de cromo 400mcg", "Ácido alfa-lipóico 600mg"],
      category: "metabolica",
      description: "Regulação natural da glicemia e sensibilidade insulínica"
    },
    {
      name: "Antioxidante Completo",
      indication: "Proteção celular e anti-aging",
      composition: ["Resveratrol 500mg", "Coenzima Q10 150mg", "Vitamina D3 2000UI"],
      category: "antioxidante",
      description: "Proteção contra radicais livres e envelhecimento"
    }
  ];

  const categories = [
    { value: 'todas', label: 'Todas as categorias' },
    { value: 'anti-inflamatoria', label: 'Anti-inflamatória' },
    { value: 'energia', label: 'Energia' },
    { value: 'muscular', label: 'Muscular' },
    { value: 'imunidade', label: 'Imunidade' },
    { value: 'metabolica', label: 'Metabólica' },
    { value: 'antioxidante', label: 'Antioxidante' }
  ];

  const filteredSuggestions = selectedCategory === 'todas' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const handleSelectSuggestion = (suggestion: FormulaSuggestion) => {
    onSelectSuggestion(suggestion);
    onClose();
  };

  return (
    <Card className="bg-slate-800 border-slate-600 p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Sugestões de Fórmulas</h3>
        <Button onClick={onClose} size="sm" variant="ghost">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredSuggestions.map((suggestion, index) => (
          <Card key={index} className="bg-slate-700 border-slate-600 p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-emerald-300 mb-1">{suggestion.name}</h4>
                <Badge className="bg-purple-600/30 text-purple-300 text-xs mb-2">
                  {suggestion.indication}
                </Badge>
                <p className="text-sm text-slate-300 mb-2">{suggestion.description}</p>
                <div className="space-y-1">
                  {suggestion.composition.map((item, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => handleSelectSuggestion(suggestion)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 ml-2"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-400 bg-slate-700/30 p-2 rounded flex items-center gap-2">
        <Target className="w-3 h-3" />
        Selecione uma sugestão para analisar ou usar como base para sua prescrição
      </div>
    </Card>
  );
};

export default FormulaSuggestionsPanel;
