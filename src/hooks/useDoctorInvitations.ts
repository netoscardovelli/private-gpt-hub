
import { useDoctorInvitationsQuery } from './useDoctorInvitationsQuery';
import { useDoctorInvitationMutations } from './useDoctorInvitationMutations';

export const useDoctorInvitations = () => {
  const { data: invitations, isLoading, error } = useDoctorInvitationsQuery();
  const mutations = useDoctorInvitationMutations();

  return {
    invitations,
    isLoading,
    error,
    ...mutations
  };
};
