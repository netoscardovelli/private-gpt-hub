
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { fetchDoctorInvitations } from '@/services/doctorInvitations';

export const useDoctorInvitationsQuery = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['doctor-invitations', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        console.log('⚠️ Usuário não tem organização');
        return [];
      }
      
      if (!['admin', 'super_admin', 'owner'].includes(profile?.role || '')) {
        console.log('⚠️ Usuário não tem permissão:', profile?.role);
        return [];
      }

      console.log('🔍 Buscando convites para organização:', profile.organization_id);
      return fetchDoctorInvitations(profile.organization_id);
    },
    enabled: !!profile?.organization_id && ['admin', 'super_admin', 'owner'].includes(profile?.role || ''),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 30000
  });
};
