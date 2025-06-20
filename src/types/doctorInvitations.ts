
export interface DoctorInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token: string;
  expires_at: string;
  created_at: string;
  invited_by: string;
  invited_by_name?: string;
  organization_id: string;
}

export interface InvitationFilters {
  organization_id: string;
  role: string;
}
