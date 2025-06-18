
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SystemSettings {
  id?: string;
  user_id: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useSystemSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações.',
          variant: 'destructive',
        });
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (
    primaryColor: string,
    secondaryColor: string,
    companyName: string,
    logoFile?: File | null
  ) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      let logoUrl = settings?.logo_url;

      // Upload do logo se um arquivo foi fornecido
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          toast({
            title: 'Erro',
            description: 'Não foi possível fazer upload do logo.',
            variant: 'destructive',
          });
          return false;
        }

        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(uploadData.path);
        
        logoUrl = urlData.publicUrl;
      }

      const settingsData = {
        user_id: user.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        company_name: companyName,
        logo_url: logoUrl,
      };

      let result;
      if (settings?.id) {
        // Atualizar configurações existentes
        result = await supabase
          .from('system_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Criar novas configurações
        result = await supabase
          .from('system_settings')
          .insert([settingsData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erro ao salvar configurações:', result.error);
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar as configurações.',
          variant: 'destructive',
        });
        return false;
      }

      setSettings(result.data);
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!',
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
  };
};
