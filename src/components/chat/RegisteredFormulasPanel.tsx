
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Send, Trash2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Formula {
  id: string;
  name: string;
  indication: string;
  composition: string;
  dosage: string;
  createdAt: Date;
}

interface RegisteredFormulasPanelProps {
  onClose: () => void;
  onSelectFormula: (formula: Formula) => void;
}

const RegisteredFormulasPanel = ({ onClose, onSelectFormula }: RegisteredFormulasPanelProps) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: '',
    indication: '',
    composition: '',
    dosage: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Carregar fórmulas do localStorage
    const savedFormulas = localStorage.getItem('userFormulas');
    if (savedFormulas) {
      setFormulas(JSON.parse(savedFormulas));
    }
  }, []);

  const saveFormulas = (updatedFormulas: Formula[]) => {
    localStorage.setItem('userFormulas', JSON.stringify(updatedFormulas));
    setFormulas(updatedFormulas);
  };

  const handleAddFormula = () => {
    if (!newFormula.name || !newFormula.composition) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e composição são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const formula: Formula = {
      id: Date.now().toString(),
      ...newFormula,
      createdAt: new Date()
    };

    const updatedFormulas = [...formulas, formula];
    saveFormulas(updatedFormulas);

    setNewFormula({ name: '', indication: '', composition: '', dosage: '' });
    setShowAddForm(false);

    toast({
      title: "Fórmula adicionada",
      description: "Fórmula salva com sucesso!",
    });
  };

  const handleDeleteFormula = (id: string) => {
    const updatedFormulas = formulas.filter(f => f.id !== id);
    saveFormulas(updatedFormulas);

    toast({
      title: "Fórmula removida",
      description: "Fórmula excluída com sucesso.",
    });
  };

  const handleSelectFormula = (formula: Formula) => {
    onSelectFormula(formula);
    onClose();
  };

  return (
    <Card className="bg-slate-800 border-slate-600 p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Fórmulas Cadastradas</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova
          </Button>
          <Button onClick={onClose} size="sm" variant="ghost">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="bg-slate-700 border-slate-600 p-3 mb-4">
          <div className="space-y-3">
            <Input
              placeholder="Nome da fórmula"
              value={newFormula.name}
              onChange={(e) => setNewFormula(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-600 border-slate-500 text-white"
            />
            <Input
              placeholder="Indicação clínica"
              value={newFormula.indication}
              onChange={(e) => setNewFormula(prev => ({ ...prev, indication: e.target.value }))}
              className="bg-slate-600 border-slate-500 text-white"
            />
            <Textarea
              placeholder="Composição (ex: Magnésio 300mg, Zinco 15mg...)"
              value={newFormula.composition}
              onChange={(e) => setNewFormula(prev => ({ ...prev, composition: e.target.value }))}
              className="bg-slate-600 border-slate-500 text-white"
              rows={3}
            />
            <Input
              placeholder="Posologia"
              value={newFormula.dosage}
              onChange={(e) => setNewFormula(prev => ({ ...prev, dosage: e.target.value }))}
              className="bg-slate-600 border-slate-500 text-white"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddFormula} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              <Button onClick={() => setShowAddForm(false)} size="sm" variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {formulas.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma fórmula cadastrada ainda</p>
          <p className="text-sm">Clique em "Nova" para adicionar sua primeira fórmula</p>
        </div>
      ) : (
        <div className="space-y-3">
          {formulas.map((formula) => (
            <Card key={formula.id} className="bg-slate-700 border-slate-600 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-emerald-300 mb-1">{formula.name}</h4>
                  {formula.indication && (
                    <Badge className="bg-blue-600/30 text-blue-300 text-xs mb-2">
                      {formula.indication}
                    </Badge>
                  )}
                  <p className="text-sm text-slate-300 mb-2">{formula.composition}</p>
                  {formula.dosage && (
                    <p className="text-xs text-slate-400">Posologia: {formula.dosage}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    onClick={() => handleSelectFormula(formula)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteFormula(formula.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RegisteredFormulasPanel;
