
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useOrganizationData = () => {
  const { profile } = useAuth();

  const { data: organizationFormulas, isLoading: formulasLoading } = useQuery({
    queryKey: ['organization-formulas', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('reference_formulas')
        .select(`
          *,
          reference_formula_actives(*)
        `)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const { data: favoriteFormulas, isLoading: favoritesLoading } = useQuery({
    queryKey: ['organization-favorite-formulas', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('organization_favorite_formulas')
        .select(`
          *,
          reference_formulas(
            *,
            reference_formula_actives(*)
          )
        `)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const { data: organizationStats, isLoading: statsLoading } = useQuery({
    queryKey: ['organization-stats', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('organization_id', profile.organization_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  const addFavoriteFormula = async (formulaId: string) => {
    if (!profile?.organization_id || !profile?.id) return;

    const { error } = await supabase
      .from('organization_favorite_formulas')
      .insert({
        organization_id: profile.organization_id,
        formula_id: formulaId,
        added_by: profile.id
      });

    if (error) throw error;
  };

  const removeFavoriteFormula = async (formulaId: string) => {
    if (!profile?.organization_id) return;

    const { error } = await supabase
      .from('organization_favorite_formulas')
      .delete()
      .eq('organization_id', profile.organization_id)
      .eq('formula_id', formulaId);

    if (error) throw error;
  };

  return {
    organizationFormulas,
    favoriteFormulas,
    organizationStats,
    isLoading: formulasLoading || favoritesLoading || statsLoading,
    addFavoriteFormula,
    removeFavoriteFormula
  };
};
