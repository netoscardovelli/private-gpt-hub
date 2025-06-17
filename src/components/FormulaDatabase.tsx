
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Upload, Filter, Database, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FormulaImporter from './FormulaImporter';

interface ReferenceFormula {
  id: string;
  name: string;
  category: string;
  pharmaceutical_form: string;
  specialty: string;
  description?: string;
  clinical_indication?: string;
  reference_formula_actives?: {
    active_name: string;
    concentration_mg: number;
    concentration_text?: string;
    role_in_formula?: string;
  }[];
}

const FormulaDatabase = () => {
  const [formulas, setFormulas] = useState<ReferenceFormula[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = ['all', 'performance', 'emagrecimento', 'antienvelhecimento', 'libido', 'sono', 'ansiedade', 'Geral'];
  const specialties = ['all', 'endocrinologia', 'dermatologia', 'medicina esportiva', 'ginecologia', 'urologia', 'geral'];

  useEffect(() => {
    loadFormulas();
  }, []);

  const loadFormulas = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando fórmulas do banco de dados...');
      
      // Primeiro, vamos verificar quantas fórmulas existem
      const { count, error: countError } = await supabase
        .from('reference_formulas')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Erro ao contar fórmulas:', countError);
      } else {
        console.log(`📊 Total de fórmulas encontradas: ${count}`);
      }

      const { data, error } = await supabase
        .from('reference_formulas')
        .select(`
          *,
          reference_formula_actives (
            active_name,
            concentration_mg,
            concentration_text,
            role_in_formula
          )
        `)
        .order('name');

      console.log('📦 Dados retornados:', data);
      console.log('⚠️ Erro (se houver):', error);

      if (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} fórmulas carregadas com sucesso`);
      setFormulas(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Fórmulas carregadas!",
          description: `${data.length} fórmula(s) encontrada(s) no banco.`,
        });
      } else {
        toast({
          title: "Nenhuma fórmula encontrada",
          description: "O banco de dados está vazio ou houve um problema na consulta.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('💥 Erro completo ao carregar fórmulas:', error);
      toast({
        title: "Erro ao carregar",
        description: `Não foi possível carregar o banco de fórmulas: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
    const matchesSpecialty = selectedSpecialty === 'all' || formula.specialty === selectedSpecialty;
    
    return matchesSearch && matchesCategory && matchesSpecialty;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-emerald-600 animate-pulse" />
          <p className="text-lg font-medium">Carregando banco de fórmulas...</p>
          <p className="text-sm text-slate-600 mt-2">Verificando conexão com o banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Banco de Fórmulas</h1>
          <p className="text-slate-600 mt-1">
            {formulas.length} fórmulas de referência disponíveis
          </p>
        </div>
        <Button 
          onClick={loadFormulas} 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Atualizar</span>
        </Button>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Consultar Fórmulas</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Importar Fórmulas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtros de Busca</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Buscar</label>
                  <Input
                    placeholder="Nome, categoria ou especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Todas as categorias' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Especialidade</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>
                        {spec === 'all' ? 'Todas as especialidades' : spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Fórmulas */}
          <div className="grid gap-4">
            {formulas.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium mb-2">Banco de fórmulas vazio</h3>
                  <p className="text-slate-600 mb-4">
                    Não há fórmulas salvas ainda. Use a aba "Importar Fórmulas" para adicionar fórmulas ao banco.
                  </p>
                  <Button onClick={loadFormulas} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar novamente
                  </Button>
                </CardContent>
              </Card>
            ) : filteredFormulas.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma fórmula encontrada</h3>
                  <p className="text-slate-600">
                    Tente ajustar os filtros de busca ou limpar os termos de pesquisa
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFormulas.map((formula) => (
                <Card key={formula.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          {formula.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{formula.category}</Badge>
                          <Badge variant="outline">{formula.pharmaceutical_form}</Badge>
                          <Badge variant="outline">{formula.specialty}</Badge>
                        </div>
                        {formula.description && (
                          <p className="text-slate-600 text-sm mb-2">{formula.description}</p>
                        )}
                        {formula.clinical_indication && (
                          <p className="text-emerald-700 text-sm font-medium">
                            📋 {formula.clinical_indication}
                          </p>
                        )}
                      </div>
                    </div>

                    {formula.reference_formula_actives && formula.reference_formula_actives.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-700 mb-3">Composição:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {formula.reference_formula_actives.map((active, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg">
                              <div className="font-medium text-slate-800">{active.active_name}</div>
                              <div className="text-sm text-slate-600">
                                {active.concentration_text || `${active.concentration_mg}mg`}
                              </div>
                              {active.role_in_formula && (
                                <div className="text-xs text-emerald-600 mt-1">
                                  {active.role_in_formula}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="import">
          <FormulaImporter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormulaDatabase;
