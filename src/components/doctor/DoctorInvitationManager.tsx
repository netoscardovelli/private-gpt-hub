
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorInvitations } from '@/hooks/useDoctorInvitations';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus } from 'lucide-react';
import PermissionCheck from './PermissionCheck';
import InvitationDialog from './InvitationDialog';
import InvitationTable from './InvitationTable';

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

  const hasOrganization = !!profile?.organization_id;
  const hasPermission = ['admin', 'super_admin', 'owner'].includes(profile?.role || '');

  return (
    <PermissionCheck
      hasOrganization={hasOrganization}
      hasPermission={hasPermission}
      userRole={profile?.role}
      error={error}
    >
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
            
            <InvitationDialog 
              onInvite={inviteDoctor}
              isInviting={isInviting}
            />
          </div>

          <InvitationTable
            invitations={invitations}
            isLoading={isLoading}
            onCancel={cancelInvitation}
            onResend={resendInvitation}
          />
        </CardContent>
      </Card>
    </PermissionCheck>
  );
};

export default DoctorInvitationManager;
