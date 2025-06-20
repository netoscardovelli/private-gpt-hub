
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDoctorInvitations } from '@/hooks/useDoctorInvitations';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Mail, Calendar, MoreHorizontal, AlertCircle, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const DoctorInvitationManager = () => {
  const { profile } = useAuth();
  const { 
    invitations, 
    isLoading, 
    error,
    inviteDoctor, 
    cancelInvitation, 
    resendInvitation,
    isInviting 
  } = useDoctorInvitations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDoctorEmail, setNewDoctorEmail] = useState('');

  const handleInviteDoctor = () => {
    if (!newDoctorEmail.trim()) return;
    
    inviteDoctor(newDoctorEmail);
    setNewDoctorEmail('');
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'default' as const },
      accepted: { label: 'Aceito', variant: 'secondary' as const },
      expired: { label: 'Expirado', variant: 'destructive' as const },
      cancelled: { label: 'Cancelado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Verificar se o usuário tem permissão para gerenciar convites
  if (!profile?.organization_id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa estar associado a uma organização para gerenciar convites de médicos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para gerenciar convites de médicos. 
              Role atual: <strong>{profile?.role || 'não definido'}</strong>. 
              Roles necessários: admin, super_admin ou owner.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Convites para Médicos
        </CardTitle>
        <CardDescription>
          Gerencie os convites enviados para médicos se cadastrarem na sua farmácia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Convites Enviados</h3>
            <p className="text-sm text-slate-600">
              {invitations?.length || 0} convite(s) total
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Convidar Médico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Médico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doctor-email">Email do Médico</Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    value={newDoctorEmail}
                    onChange={(e) => setNewDoctorEmail(e.target.value)}
                    placeholder="medico@exemplo.com"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleInviteDoctor} 
                    disabled={isInviting || !newDoctorEmail.trim()}
                  >
                    {isInviting ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Carregando convites...</p>
          </div>
        ) : invitations && invitations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Convidado por</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell>{invitation.invited_by_name}</TableCell>
                  <TableCell>
                    {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {invitation.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => resendInvitation(invitation.id)}>
                              Reenviar Convite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cancelInvitation(invitation.id)}>
                              Cancelar Convite
                            </DropdownMenuItem>
                          </>
                        )}
                        {invitation.status === 'expired' && (
                          <DropdownMenuItem onClick={() => resendInvitation(invitation.id)}>
                            Renovar Convite
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum convite enviado</h3>
            <p className="text-slate-600 mb-4">
              Comece convidando médicos para usar o sistema da sua farmácia
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorInvitationManager;
