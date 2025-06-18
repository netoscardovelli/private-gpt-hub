
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAPIPartners, useCreateAPIPartner, useUpdateAPIPartner, useDeleteAPIPartner } from '@/hooks/useAPIManagement';
import { Plus, Edit, Trash2, Key, Activity } from 'lucide-react';
import type { APIPartner } from '@/types/api';

const APIPartnerManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<APIPartner | null>(null);
  const [newPartner, setNewPartner] = useState({
    name: '',
    description: '',
    contact_person: '',
    email: '',
    rate_limit_per_hour: 1000,
    status: 'active' as const
  });

  const { data: partners, isLoading } = useAPIPartners();
  const createPartner = useCreateAPIPartner();
  const updatePartner = useUpdateAPIPartner();
  const deletePartner = useDeleteAPIPartner();

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPartner.mutateAsync(newPartner);
    setNewPartner({
      name: '',
      description: '',
      contact_person: '',
      email: '',
      rate_limit_per_hour: 1000,
      status: 'active'
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    
    await updatePartner.mutateAsync({
      id: editingPartner.id,
      updates: editingPartner
    });
    setEditingPartner(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando parceiros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Parceiros de API</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Parceiro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Pessoa de Contato</Label>
                <Input
                  id="contact"
                  value={newPartner.contact_person}
                  onChange={(e) => setNewPartner({ ...newPartner, contact_person: e.target.value })}
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
              <div>
                <Label htmlFor="rate-limit">Limite por Hora</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={newPartner.rate_limit_per_hour}
                  onChange={(e) => setNewPartner({ ...newPartner, rate_limit_per_hour: parseInt(e.target.value) })}
                />
              </div>
              <Button type="submit" className="w-full">
                Criar Parceiro
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {partners?.map((partner) => (
          <Card key={partner.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {partner.name}
                    <Badge className={getStatusColor(partner.status)}>
                      {partner.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {partner.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPartner(partner)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o parceiro "{partner.name}"?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePartner.mutate(partner.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{partner.email}</p>
                </div>
                <div>
                  <p className="font-medium">Contato</p>
                  <p className="text-muted-foreground">{partner.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Limite/Hora</p>
                  <p className="text-muted-foreground">{partner.rate_limit_per_hour}</p>
                </div>
                <div>
                  <p className="font-medium">Total Requests</p>
                  <p className="text-muted-foreground">{partner.total_requests}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4" />
                  <span className="font-medium">API Key</span>
                </div>
                <code className="text-sm bg-background p-2 rounded block">
                  {partner.api_key}
                </code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Partner Dialog */}
      {editingPartner && (
        <Dialog open={!!editingPartner} onOpenChange={() => setEditingPartner(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Parceiro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePartner} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingPartner.name}
                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingPartner.status}
                  onValueChange={(value) => setEditingPartner({ ...editingPartner, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-rate-limit">Limite por Hora</Label>
                <Input
                  id="edit-rate-limit"
                  type="number"
                  value={editingPartner.rate_limit_per_hour}
                  onChange={(e) => setEditingPartner({ ...editingPartner, rate_limit_per_hour: parseInt(e.target.value) })}
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default APIPartnerManagement;
