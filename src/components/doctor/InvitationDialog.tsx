
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';

interface InvitationDialogProps {
  onInvite: (email: string) => void;
  isInviting: boolean;
}

const InvitationDialog = ({ onInvite, isInviting }: InvitationDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDoctorEmail, setNewDoctorEmail] = useState('');

  const handleInviteDoctor = () => {
    if (!newDoctorEmail.trim()) return;
    
    onInvite(newDoctorEmail);
    setNewDoctorEmail('');
    setIsDialogOpen(false);
  };

  return (
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
  );
};

export default InvitationDialog;
