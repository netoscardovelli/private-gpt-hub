
import { supabase } from '@/integrations/supabase/client';
import { DoctorInvitation } from '@/types/doctorInvitations';

export const fetchDoctorInvitations = async (organizationId: string): Promise<DoctorInvitation[]> => {
  console.log('📋 Buscando convites da organização:', organizationId);

  const { data, error } = await supabase
    .from('doctor_invitations')
    .select(`
      *,
      organization:organizations(id, name, slug),
      invited_by_profile:profiles!doctor_invitations_invited_by_fkey(full_name)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar convites:', error);
    throw new Error(`Erro ao carregar convites: ${error.message}`);
  }

  console.log('✅ Convites encontrados:', data?.length || 0);

  return (data || []).map(invitation => ({
    ...invitation,
    status: invitation.status as 'pending' | 'accepted' | 'expired' | 'cancelled',
    invited_by_name: invitation.invited_by_profile?.full_name || 'Administrador',
    organization: invitation.organization ? {
      id: invitation.organization.id || invitation.organization_id,
      name: invitation.organization.name,
      slug: invitation.organization.slug
    } : undefined
  }));
};
