
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus, Users, Calendar } from 'lucide-react';
import DoctorInvitationManager from '@/components/doctor/DoctorInvitationManager';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

const OrganizationManagement = () => {
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
        .select('id, name, slug, created_at')
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
        description: "Organização criada e selecionada com sucesso!"
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

  const currentOrganization = organizations.find(org => org.id === profile?.organization_id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Gerenciamento de Organização
          </CardTitle>
          <CardDescription>
            Configure e gerencie suas organizações farmacêuticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organização Atual */}
          <div className="space-y-4">
            <Label>Organização Atual</Label>
            {currentOrganization ? (
              <div className="p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{currentOrganization.name}</h3>
                    <p className="text-sm text-slate-600">
                      Criada em {new Date(currentOrganization.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>Organização Ativa</span>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <Building className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma organização selecionada. Crie uma nova ou selecione uma existente.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Seletor de Organização */}
          {organizations.length > 0 && (
            <div className="space-y-2">
              <Label>Trocar Organização</Label>
              <Select
                value={profile?.organization_id || 'none'}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar organização" />
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
            </div>
          )}

          {/* Criar Nova Organização */}
          <div className="pt-4 border-t">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Organização
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
                      placeholder="Digite o nome da sua farmácia/organização"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createOrganization} disabled={loading || !newOrgName.trim()}>
                      {loading ? 'Criando...' : 'Criar Organização'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Convites para Médicos */}
      {profile?.organization_id && (
        <DoctorInvitationManager />
      )}
    </div>
  );
};

export default OrganizationManagement;
