
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building, Users, CreditCard } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan_type: string;
  subscription_status: string;
  created_at: string;
  user_count?: number;
}

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
    domain: '',
    plan_type: 'free'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orgsWithUserCount = data?.map(org => ({
        ...org,
        user_count: org.profiles?.length || 0
      })) || [];

      setOrganizations(orgsWithUserCount);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar organizações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    try {
      const { error } = await supabase
        .from('organizations')
        .insert([newOrg]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso"
      });

      setIsDialogOpen(false);
      setNewOrg({
        name: '',
        slug: '',
        domain: '',
        plan_type: 'free'
      });
      fetchOrganizations();
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar organização",
        variant: "destructive"
      });
    }
  };

  const getPlanColor = (plan: string) => {
    const colors = {
      free: 'secondary',
      pro: 'default',
      premium: 'destructive',
      enterprise: 'outline'
    };
    return colors[plan as keyof typeof colors] || 'secondary';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Carregando organizações...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizações</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Pagos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(o => o.plan_type !== 'free').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + (org.user_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Organizações</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Organização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Organização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={newOrg.slug}
                    onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domínio</Label>
                  <Input
                    id="domain"
                    value={newOrg.domain}
                    onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                    placeholder="exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="plan_type">Tipo de Plano</Label>
                  <select
                    id="plan_type"
                    value={newOrg.plan_type}
                    onChange={(e) => setNewOrg({ ...newOrg, plan_type: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <Button onClick={createOrganization} className="w-full">
                  Criar Organização
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="font-mono text-sm">{org.slug}</TableCell>
                  <TableCell>{org.domain || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getPlanColor(org.plan_type) as any}>
                      {org.plan_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(org.subscription_status) as any}>
                      {org.subscription_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.user_count || 0}</TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationManagement;
