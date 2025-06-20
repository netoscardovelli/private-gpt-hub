
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

      return fetchDoctorInvitations(profile.organization_id);
    },
    enabled: !!profile?.organization_id && ['admin', 'super_admin', 'owner'].includes(profile?.role || ''),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 segundos para evitar muitas requisições
  });
};
