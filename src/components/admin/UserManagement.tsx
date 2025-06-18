
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Building } from 'lucide-react';

interface User {
  id: string;
  full_name: string | null;
  role: string;
  organization_id: string | null;
  created_at: string;
}

interface Organization {
  id: string;
  name: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateUserRole, assignUserToOrganization } = useRoles();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          organization_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const success = await updateUserRole(userId, newRole as any);
    if (success) {
      fetchUsers();
    }
  };

  const handleOrganizationChange = async (userId: string, organizationId: string) => {
    const success = await assignUserToOrganization(userId, organizationId);
    if (success) {
      fetchUsers();
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      user: 'secondary',
      moderator: 'default',
      admin: 'destructive',
      super_admin: 'destructive',
      partner: 'outline'
    };
    return colors[role as keyof typeof colors] || 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Carregando usuários...</div>
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
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => ['admin', 'super_admin'].includes(u.role)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizações</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'Sem nome'}</div>
                      <div className="text-sm text-muted-foreground">{user.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(user.role) as any}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {organizations.find(org => org.id === user.organization_id)?.name || 'Nenhuma'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={user.organization_id || ''}
                        onValueChange={(value) => handleOrganizationChange(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Organização" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

export default UserManagement;
