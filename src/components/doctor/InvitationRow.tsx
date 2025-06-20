
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal } from 'lucide-react';
import { DoctorInvitation } from '@/types/doctorInvitations';
import StatusBadge from './StatusBadge';

interface InvitationRowProps {
  invitation: DoctorInvitation;
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
}

const InvitationRow = ({ invitation, onCancel, onResend }: InvitationRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{invitation.email}</TableCell>
      <TableCell>
        <StatusBadge status={invitation.status} />
      </TableCell>
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
                <DropdownMenuItem onClick={() => onResend(invitation.id)}>
                  Reenviar Convite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(invitation.id)}>
                  Cancelar Convite
                </DropdownMenuItem>
              </>
            )}
            {invitation.status === 'expired' && (
              <DropdownMenuItem onClick={() => onResend(invitation.id)}>
                Renovar Convite
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default InvitationRow;
