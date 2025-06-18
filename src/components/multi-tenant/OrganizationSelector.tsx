
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

const OrganizationSelector = () => {
  const { user, profile, updateProfile } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) return;

    setLoading(true);
    try {
      const slug = newOrgName.toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrgName,
          slug: slug,
          plan_type: 'free'
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar o perfil do usuário para incluir a nova organização
      await updateProfile({ organization_id: data.id });

      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso!"
      });

      setIsDialogOpen(false);
      setNewOrgName('');
      fetchOrganizations();
    } catch (error: any) {
      console.error('Erro ao criar organização:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar organização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationChange = async (organizationId: string) => {
    try {
      await updateProfile({ organization_id: organizationId });
      toast({
        title: "Sucesso",
        description: "Organização alterada com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao alterar organização:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar organização",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  const currentOrganization = organizations.find(org => org.id === profile?.organization_id);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={profile?.organization_id || ''}
        onValueChange={handleOrganizationChange}
      >
        <SelectTrigger className="w-48">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <SelectValue placeholder="Selecionar organização">
              {currentOrganization?.name || 'Nenhuma organização'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Nenhuma organização</SelectItem>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Organização</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">Nome da Organização</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Nome da sua organização"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createOrganization} disabled={loading || !newOrgName.trim()}>
                {loading ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationSelector;
