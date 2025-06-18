
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Building, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  subscription_status: string;
  user_count: number;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0
  });
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário é admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas
      const [usersResult, orgsResult, subsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalOrganizations: orgsResult.count || 0,
        activeSubscriptions: subsResult.count || 0,
        monthlyRevenue: 0 // Será calculado quando implementarmos Stripe
      });

      // Carregar organizações com contagem de usuários
      const { data: orgData } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          plan_type,
          subscription_status,
          created_at,
          profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (orgData) {
        const formattedOrgs = orgData.map(org => ({
          ...org,
          user_count: Array.isArray(org.profiles) ? org.profiles.length : 0
        }));
        setOrganizations(formattedOrgs);
      }

    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationPlan = async (orgId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ plan_type: newPlan })
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: "Plano da organização foi atualizado com sucesso"
      });

      loadAdminData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar plano",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Acesso Negado</span>
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o dashboard administrativo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <Button onClick={loadAdminData}>Atualizar Dados</Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizações</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com conteúdo detalhado */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Organizações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="api">API Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Organizações</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as organizações da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>{org.slug}</TableCell>
                      <TableCell>
                        <Badge variant={org.plan_type === 'free' ? 'secondary' : 'default'}>
                          {org.plan_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={org.subscription_status === 'active' ? 'default' : 'destructive'}>
                          {org.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{org.user_count}</TableCell>
                      <TableCell>
                        {new Date(org.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <select
                          value={org.plan_type}
                          onChange={(e) => updateOrganizationPlan(org.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançados</CardTitle>
              <CardDescription>
                Métricas detalhadas de uso da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics detalhados serão implementados aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API para Parceiros</CardTitle>
              <CardDescription>
                Gerencie chaves de API e acesso de parceiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Gerenciamento de API partners será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
