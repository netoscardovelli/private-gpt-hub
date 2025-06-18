
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
}

const OrganizationSelector = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    slug: '',
    domain: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrganizations();
    if (profile?.organization_id) {
      setSelectedOrgId(profile.organization_id);
    }
  }, [profile]);

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, plan_type')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
    }
  };

  const handleOrganizationChange = async (orgId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await updateProfile({
        organization_id: orgId
      });

      if (!error) {
        setSelectedOrgId(orgId);
        toast({
          title: "Organização selecionada",
          description: "Você foi associado à nova organização"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao trocar de organização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!user || !newOrgData.name.trim() || !newOrgData.slug.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Criar organização
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgData.name,
          slug: newOrgData.slug.toLowerCase(),
          domain: newOrgData.domain || null,
          plan_type: 'free'
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Atribuir usuário à nova organização como admin
      const { error: profileError } = await updateProfile({
        organization_id: newOrg.id,
        role: 'admin'
      });

      if (profileError) throw profileError;

      // Atualizar lista e selecionar nova org
      await loadOrganizations();
      setSelectedOrgId(newOrg.id);
      setShowCreateDialog(false);
      setNewOrgData({ name: '', slug: '', domain: '' });

      toast({
        title: "Organização criada",
        description: "Nova organização foi criada com sucesso"
      });

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setNewOrgData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  return (
    <div className="flex items-center space-x-2">
      <Building className="w-4 h-4 text-muted-foreground" />
      
      <Select
        value={selectedOrgId}
        onValueChange={handleOrganizationChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecionar organização" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name} ({org.plan_type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nova
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Organização</DialogTitle>
            <DialogDescription>
              Crie uma nova organização para sua equipe
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Organização *</Label>
              <Input
                id="name"
                value={newOrgData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Minha Empresa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={newOrgData.slug}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="minha-empresa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domínio (opcional)</Label>
              <Input
                id="domain"
                value={newOrgData.domain}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, domain: e.target.value }))}
                placeholder="minhaempresa.com"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={createOrganization} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Organização'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationSelector;
