
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferenceFormula {
  id: string;
  name: string;
  category: string;
  pharmaceutical_form: string;
  target_dosage_per_day: number;
  total_weight_mg: number | null;
  capsules_per_dose: number | null;
  specialty: string;
  description: string | null;
  clinical_indication: string | null;
}

interface FormulaActive {
  id: string;
  formula_id: string;
  active_name: string;
  concentration_mg: number;
  concentration_text: string | null;
  role_in_formula: string | null;
  mechanism_notes: string | null;
}

const FormulaDatabase = () => {
  const [formulas, setFormulas] = useState<ReferenceFormula[]>([]);
  const [actives, setActives] = useState<FormulaActive[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [isAddingFormula, setIsAddingFormula] = useState(false);
  const [isAddingActive, setIsAddingActive] = useState(false);
  const { toast } = useToast();

  const [newFormula, setNewFormula] = useState({
    name: '',
    category: '',
    pharmaceutical_form: 'capsula',
    target_dosage_per_day: 1,
    total_weight_mg: '',
    capsules_per_dose: '',
    specialty: 'geral',
    description: '',
    clinical_indication: ''
  });

  const [newActive, setNewActive] = useState({
    active_name: '',
    concentration_mg: '',
    concentration_text: '',
    role_in_formula: 'principal',
    mechanism_notes: ''
  });

  useEffect(() => {
    fetchFormulas();
  }, []);

  useEffect(() => {
    if (selectedFormula) {
      fetchActives(selectedFormula);
    }
  }, [selectedFormula]);

  const fetchFormulas = async () => {
    try {
      const { data, error } = await supabase
        .from('reference_formulas')
        .select('*')
        .order('name');

      if (error) throw error;
      setFormulas(data || []);
    } catch (error) {
      console.error('Erro ao buscar fórmulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fórmulas de referência.",
        variant: "destructive"
      });
    }
  };

  const fetchActives = async (formulaId: string) => {
    try {
      const { data, error } = await supabase
        .from('reference_formula_actives')
        .select('*')
        .eq('formula_id', formulaId)
        .order('active_name');

      if (error) throw error;
      setActives(data || []);
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
    }
  };

  const addFormula = async () => {
    try {
      const formulaData = {
        ...newFormula,
        total_weight_mg: newFormula.total_weight_mg ? parseInt(newFormula.total_weight_mg) : null,
        capsules_per_dose: newFormula.capsules_per_dose ? parseInt(newFormula.capsules_per_dose) : null
      };

      const { error } = await supabase
        .from('reference_formulas')
        .insert([formulaData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fórmula adicionada com sucesso!"
      });

      setNewFormula({
        name: '',
        category: '',
        pharmaceutical_form: 'capsula',
        target_dosage_per_day: 1,
        total_weight_mg: '',
        capsules_per_dose: '',
        specialty: 'geral',
        description: '',
        clinical_indication: ''
      });
      setIsAddingFormula(false);
      fetchFormulas();
    } catch (error) {
      console.error('Erro ao adicionar fórmula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a fórmula.",
        variant: "destructive"
      });
    }
  };

  const addActive = async () => {
    if (!selectedFormula) return;

    try {
      const activeData = {
        ...newActive,
        formula_id: selectedFormula,
        concentration_mg: parseFloat(newActive.concentration_mg)
      };

      const { error } = await supabase
        .from('reference_formula_actives')
        .insert([activeData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ativo adicionado com sucesso!"
      });

      setNewActive({
        active_name: '',
        concentration_mg: '',
        concentration_text: '',
        role_in_formula: 'principal',
        mechanism_notes: ''
      });
      setIsAddingActive(false);
      fetchActives(selectedFormula);
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ativo.",
        variant: "destructive"
      });
    }
  };

  const deleteFormula = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reference_formulas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fórmula removida com sucesso!"
      });

      fetchFormulas();
      if (selectedFormula === id) {
        setSelectedFormula(null);
        setActives([]);
      }
    } catch (error) {
      console.error('Erro ao deletar fórmula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a fórmula.",
        variant: "destructive"
      });
    }
  };

  const deleteActive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reference_formula_actives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ativo removido com sucesso!"
      });

      if (selectedFormula) {
        fetchActives(selectedFormula);
      }
    } catch (error) {
      console.error('Erro ao deletar ativo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o ativo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banco de Fórmulas de Referência</h2>
        <Button onClick={() => setIsAddingFormula(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Fórmula
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Fórmulas */}
        <Card>
          <CardHeader>
            <CardTitle>Fórmulas ({formulas.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formulas.map((formula) => (
              <div
                key={formula.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFormula === formula.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFormula(formula.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{formula.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{formula.category}</Badge>
                      <Badge variant="outline">{formula.pharmaceutical_form}</Badge>
                      <Badge variant="outline">{formula.specialty}</Badge>
                    </div>
                    {formula.description && (
                      <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {formula.capsules_per_dose && `${formula.capsules_per_dose} cáps/dose`}
                      {formula.total_weight_mg && ` • ${formula.total_weight_mg}mg total`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFormula(formula.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {isAddingFormula && (
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Nome da fórmula"
                    value={newFormula.name}
                    onChange={(e) => setNewFormula({...newFormula, name: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Categoria"
                      value={newFormula.category}
                      onChange={(e) => setNewFormula({...newFormula, category: e.target.value})}
                    />
                    <Select
                      value={newFormula.pharmaceutical_form}
                      onValueChange={(value) => setNewFormula({...newFormula, pharmaceutical_form: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capsula">Cápsula</SelectItem>
                        <SelectItem value="po">Pó</SelectItem>
                        <SelectItem value="sache">Sachê</SelectItem>
                        <SelectItem value="creme">Creme</SelectItem>
                        <SelectItem value="gel">Gel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Doses/dia"
                      value={newFormula.target_dosage_per_day}
                      onChange={(e) => setNewFormula({...newFormula, target_dosage_per_day: parseInt(e.target.value) || 1})}
                    />
                    <Input
                      type="number"
                      placeholder="Peso total (mg)"
                      value={newFormula.total_weight_mg}
                      onChange={(e) => setNewFormula({...newFormula, total_weight_mg: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="Cáps/dose"
                      value={newFormula.capsules_per_dose}
                      onChange={(e) => setNewFormula({...newFormula, capsules_per_dose: e.target.value})}
                    />
                  </div>
                  <Textarea
                    placeholder="Descrição"
                    value={newFormula.description}
                    onChange={(e) => setNewFormula({...newFormula, description: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <Button onClick={addFormula} size="sm">Salvar</Button>
                    <Button variant="outline" onClick={() => setIsAddingFormula(false)} size="sm">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Ativos da Fórmula Selecionada */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedFormula ? 'Ativos da Fórmula' : 'Selecione uma Fórmula'}
              </CardTitle>
              {selectedFormula && (
                <Button onClick={() => setIsAddingActive(true)} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFormula ? (
              <>
                {actives.map((active) => (
                  <div key={active.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{active.active_name}</h4>
                        <p className="text-sm text-gray-600">
                          {active.concentration_text || `${active.concentration_mg}mg`}
                        </p>
                        {active.role_in_formula && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {active.role_in_formula}
                          </Badge>
                        )}
                        {active.mechanism_notes && (
                          <p className="text-xs text-gray-500 mt-1">{active.mechanism_notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteActive(active.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {isAddingActive && (
                  <Card className="border-dashed">
                    <CardContent className="p-4 space-y-3">
                      <Input
                        placeholder="Nome do ativo"
                        value={newActive.active_name}
                        onChange={(e) => setNewActive({...newActive, active_name: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Concentração (mg)"
                          value={newActive.concentration_mg}
                          onChange={(e) => setNewActive({...newActive, concentration_mg: e.target.value})}
                        />
                        <Input
                          placeholder="Texto concentração"
                          value={newActive.concentration_text}
                          onChange={(e) => setNewActive({...newActive, concentration_text: e.target.value})}
                        />
                      </div>
                      <Select
                        value={newActive.role_in_formula}
                        onValueChange={(value) => setNewActive({...newActive, role_in_formula: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="principal">Principal</SelectItem>
                          <SelectItem value="sinergico">Sinérgico</SelectItem>
                          <SelectItem value="adjuvante">Adjuvante</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Notas sobre mecanismo"
                        value={newActive.mechanism_notes}
                        onChange={(e) => setNewActive({...newActive, mechanism_notes: e.target.value})}
                      />
                      <div className="flex gap-2">
                        <Button onClick={addActive} size="sm">Salvar</Button>
                        <Button variant="outline" onClick={() => setIsAddingActive(false)} size="sm">
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Selecione uma fórmula à esquerda para ver seus ativos
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormulaDatabase;
