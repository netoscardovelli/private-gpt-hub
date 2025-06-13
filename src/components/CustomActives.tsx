
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomActive {
  id: string;
  name: string;
  concentration: string;
  conditions: string[];
  description: string;
  formulationType: string;
}

const CustomActives = () => {
  const [actives, setActives] = useState<CustomActive[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newActive, setNewActive] = useState({
    name: '',
    concentration: '',
    conditions: '',
    description: '',
    formulationType: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadActives();
  }, []);

  const loadActives = () => {
    const savedActives = localStorage.getItem('customActives');
    if (savedActives) {
      setActives(JSON.parse(savedActives));
    }
  };

  const saveActives = (updatedActives: CustomActive[]) => {
    localStorage.setItem('customActives', JSON.stringify(updatedActives));
    setActives(updatedActives);
  };

  const handleAddActive = () => {
    if (!newActive.name || !newActive.conditions) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do ativo e condições são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const active: CustomActive = {
      id: Date.now().toString(),
      name: newActive.name,
      concentration: newActive.concentration,
      conditions: newActive.conditions.split(',').map(c => c.trim()),
      description: newActive.description,
      formulationType: newActive.formulationType
    };

    const updatedActives = [...actives, active];
    saveActives(updatedActives);
    setNewActive({ name: '', concentration: '', conditions: '', description: '', formulationType: '' });
    setIsAdding(false);
    
    toast({
      title: "Ativo adicionado",
      description: "Ativo personalizado salvo com sucesso.",
    });
  };

  const handleDeleteActive = (id: string) => {
    const updatedActives = actives.filter(active => active.id !== id);
    saveActives(updatedActives);
    
    toast({
      title: "Ativo removido",
      description: "Ativo personalizado removido com sucesso.",
    });
  };

  const startEditing = (active: CustomActive) => {
    setEditingId(active.id);
    setNewActive({
      name: active.name,
      concentration: active.concentration,
      conditions: active.conditions.join(', '),
      description: active.description,
      formulationType: active.formulationType
    });
  };

  const saveEdit = () => {
    const updatedActives = actives.map(active => 
      active.id === editingId ? {
        ...active,
        name: newActive.name,
        concentration: newActive.concentration,
        conditions: newActive.conditions.split(',').map(c => c.trim()),
        description: newActive.description,
        formulationType: newActive.formulationType
      } : active
    );
    
    saveActives(updatedActives);
    setEditingId(null);
    setNewActive({ name: '', concentration: '', conditions: '', description: '', formulationType: '' });
    
    toast({
      title: "Ativo atualizado",
      description: "Ativo personalizado atualizado com sucesso.",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewActive({ name: '', concentration: '', conditions: '', description: '', formulationType: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ativos Personalizados</h2>
          <p className="text-slate-300">Configure seus ativos preferidos para sugestões automáticas de fórmulas</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ativo
        </Button>
      </div>

      {/* Formulário de adição/edição */}
      {(isAdding || editingId) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Editar Ativo' : 'Novo Ativo Personalizado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Nome do Ativo *</Label>
                <Input
                  id="name"
                  value={newActive.name}
                  onChange={(e) => setNewActive({...newActive, name: e.target.value})}
                  placeholder="Ex: Dapagliflozina"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="concentration" className="text-slate-300">Concentração Usual</Label>
                <Input
                  id="concentration"
                  value={newActive.concentration}
                  onChange={(e) => setNewActive({...newActive, concentration: e.target.value})}
                  placeholder="Ex: 10mg"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="conditions" className="text-slate-300">Condições Associadas *</Label>
              <Input
                id="conditions"
                value={newActive.conditions}
                onChange={(e) => setNewActive({...newActive, conditions: e.target.value})}
                placeholder="Ex: resistência à insulina, diabetes tipo 2, síndrome metabólica (separar por vírgula)"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">Separe múltiplas condições por vírgula</p>
            </div>

            <div>
              <Label htmlFor="formulationType" className="text-slate-300">Tipo de Formulação</Label>
              <Input
                id="formulationType"
                value={newActive.formulationType}
                onChange={(e) => setNewActive({...newActive, formulationType: e.target.value})}
                placeholder="Ex: cápsula, creme, gel, solução oral"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">Descrição/Mecanismo de Ação</Label>
              <Textarea
                id="description"
                value={newActive.description}
                onChange={(e) => setNewActive({...newActive, description: e.target.value})}
                placeholder="Descreva o mecanismo de ação e indicações específicas"
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingId ? saveEdit : handleAddActive}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Salvar Alterações' : 'Adicionar Ativo'}
              </Button>
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de ativos */}
      <div className="grid gap-4">
        {actives.map((active) => (
          <Card key={active.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{active.name}</h3>
                    {active.concentration && (
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                        {active.concentration}
                      </Badge>
                    )}
                    {active.formulationType && (
                      <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                        {active.formulationType}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-slate-300 mb-2">Condições associadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {active.conditions.map((condition, index) => (
                        <Badge key={index} className="bg-blue-600 text-white">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {active.description && (
                    <p className="text-sm text-slate-400">{active.description}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => startEditing(active)}
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteActive(active.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {actives.length === 0 && !isAdding && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400 mb-4">Nenhum ativo personalizado cadastrado ainda.</p>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Ativo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomActives;
