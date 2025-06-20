
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { DoctorInvitation } from '@/types/doctorInvitations';
import InvitationRow from './InvitationRow';

interface InvitationTableProps {
  invitations: DoctorInvitation[] | undefined;
  isLoading: boolean;
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
}

const InvitationTable = ({ invitations, isLoading, onCancel, onResend }: InvitationTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Carregando convites...</p>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum convite enviado</h3>
        <p className="text-slate-600 mb-4">
          Comece convidando médicos para usar o sistema da sua farmácia
        </p>
      </div>
    );
  }

  return (
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
          <InvitationRow
            key={invitation.id}
            invitation={invitation}
            onCancel={onCancel}
            onResend={onResend}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default InvitationTable;
