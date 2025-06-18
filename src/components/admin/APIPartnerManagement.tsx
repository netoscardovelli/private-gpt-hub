
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Key, Activity, AlertCircle } from 'lucide-react';

interface APIPartner {
  id: string;
  name: string;
  email: string;
  api_key: string;
  status: string;
  rate_limit_per_hour: number;
  contact_person: string | null;
  description: string | null;
  total_requests: number | null;
  last_used_at: string | null;
  created_at: string;
}

const APIPartnerManagement = () => {
  const [partners, setPartners] = useState<APIPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    contact_person: '',
    description: '',
    rate_limit_per_hour: 1000
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('api_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar parceiros da API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async () => {
    try {
      const { error } = await supabase
        .from('api_partners')
        .insert([newPartner]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parceiro criado com sucesso"
      });

      setIsDialogOpen(false);
      setNewPartner({
        name: '',
        email: '',
        contact_person: '',
        description: '',
        rate_limit_per_hour: 1000
      });
      fetchPartners();
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar parceiro",
        variant: "destructive"
      });
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('api_partners')
        .update({ status })
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso"
      });

      fetchPartners();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copiado",
      description: "API Key copiada para a área de transferência"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Carregando parceiros...</div>
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
            <CardTitle className="text-sm font-medium">Total de Parceiros</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.status === 'suspended').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Parceiros da API</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Parceiro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Pessoa de Contato</Label>
                  <Input
                    id="contact_person"
                    value={newPartner.contact_person}
                    onChange={(e) => setNewPartner({ ...newPartner, contact_person: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="rate_limit">Limite por Hora</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={newPartner.rate_limit_per_hour}
                    onChange={(e) => setNewPartner({ ...newPartner, rate_limit_per_hour: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newPartner.description}
                    onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                  />
                </div>
                <Button onClick={createPartner} className="w-full">
                  Criar Parceiro
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
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Limite/Hora</TableHead>
                <TableHead>Total Requests</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-sm text-muted-foreground">{partner.contact_person}</div>
                    </div>
                  </TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(partner.status) as any}>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyApiKey(partner.api_key)}
                      className="font-mono text-xs"
                    >
                      {partner.api_key.substring(0, 8)}...
                    </Button>
                  </TableCell>
                  <TableCell>{partner.rate_limit_per_hour}</TableCell>
                  <TableCell>{partner.total_requests || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {partner.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePartnerStatus(partner.id, 'suspended')}
                        >
                          Suspender
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePartnerStatus(partner.id, 'active')}
                        >
                          Ativar
                        </Button>
                      )}
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

export default APIPartnerManagement;
