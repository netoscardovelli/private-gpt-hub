
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'admin' | 'moderator' | 'super_admin' | 'partner';

interface RolePermissions {
  canManageUsers: boolean;
  canManageOrganizations: boolean;
  canAccessAnalytics: boolean;
  canManageAPI: boolean;
  canManageSubscriptions: boolean;
}

export const useRoles = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getUserRole = (): UserRole => {
    return (profile?.role as UserRole) || 'user';
  };

  const getPermissions = (role: UserRole): RolePermissions => {
    const permissions: Record<UserRole, RolePermissions> = {
      user: {
        canManageUsers: false,
        canManageOrganizations: false,
        canAccessAnalytics: false,
        canManageAPI: false,
        canManageSubscriptions: false
      },
      moderator: {
        canManageUsers: true,
        canManageOrganizations: false,
        canAccessAnalytics: true,
        canManageAPI: false,
        canManageSubscriptions: false
      },
      admin: {
        canManageUsers: true,
        canManageOrganizations: true,
        canAccessAnalytics: true,
        canManageAPI: false,
        canManageSubscriptions: true
      },
      super_admin: {
        canManageUsers: true,
        canManageOrganizations: true,
        canAccessAnalytics: true,
        canManageAPI: true,
        canManageSubscriptions: true
      },
      partner: {
        canManageUsers: false,
        canManageOrganizations: false,
        canAccessAnalytics: true,
        canManageAPI: true,
        canManageSubscriptions: false
      }
    };

    return permissions[role];
  };

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    const role = getUserRole();
    const permissions = getPermissions(role);
    return permissions[permission];
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    if (!hasPermission('canManageUsers')) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para alterar roles de usuários",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Role atualizado",
        description: "Role do usuário foi atualizado com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar role do usuário",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignUserToOrganization = async (userId: string, organizationId: string): Promise<boolean> => {
    if (!hasPermission('canManageOrganizations')) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para gerenciar organizações",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          organization_id: organizationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário atribuído",
        description: "Usuário foi atribuído à organização com sucesso"
      });

      return true;
    } catch (error) {
      console.error('Erro ao atribuir usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao atribuir usuário à organização",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getUserRole,
    getPermissions,
    hasPermission,
    updateUserRole,
    assignUserToOrganization,
    loading,
    currentRole: getUserRole(),
    currentPermissions: getPermissions(getUserRole())
  };
};
