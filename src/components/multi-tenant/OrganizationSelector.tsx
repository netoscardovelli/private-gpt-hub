
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

const OrganizationSelector = () => {
  const { user, profile, updateProfile } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
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

  const handleOrganizationChange = async (organizationId: string) => {
    try {
      // Convert "none" back to null for the database
      const actualOrgId = organizationId === "none" ? null : organizationId;
      await updateProfile({ organization_id: actualOrgId });
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
    <Select
      value={profile?.organization_id || 'none'}
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
        <SelectItem value="none">Nenhuma organização</SelectItem>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default OrganizationSelector;
