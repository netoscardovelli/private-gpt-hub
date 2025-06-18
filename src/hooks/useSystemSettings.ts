
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
      console.log('🔧 Carregando configurações para usuário:', user.id);
      
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
        console.log('✅ Configurações carregadas:', data);
        setSettings(data as SystemSettings | null);
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
      console.error('❌ Usuário não autenticado');
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('💾 Iniciando salvamento das configurações...');
      console.log('🔧 User ID:', user.id);
      console.log('🎨 Cores:', { primaryColor, secondaryColor });
      console.log('🏢 Nome da empresa:', companyName);
      
      let logoUrl = settings?.logo_url;

      // Upload do logo se um arquivo foi fornecido
      if (logoFile) {
        console.log('📁 Fazendo upload do logo...');
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
        console.log('✅ Logo uploadado:', logoUrl);
      }

      const settingsData = {
        user_id: user.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        company_name: companyName,
        logo_url: logoUrl,
      };

      console.log('💾 Dados para salvar:', settingsData);

      let result;
      if (settings?.id) {
        console.log('🔄 Atualizando configurações existentes...');
        // Atualizar configurações existentes
        result = await supabase
          .from('system_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        console.log('🆕 Criando novas configurações...');
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

      console.log('✅ Configurações salvas:', result.data);
      setSettings(result.data as SystemSettings);
      
      // Aplicar as cores ao sistema
      applyColorsToSystem(primaryColor, secondaryColor);
      
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

  const applyColorsToSystem = (primaryColor: string, secondaryColor: string) => {
    console.log('🎨 Aplicando cores ao sistema:', { primaryColor, secondaryColor });
    
    // Aplicar as cores como CSS custom properties
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    // Também podemos aplicar algumas classes específicas
    const root = document.documentElement;
    root.style.setProperty('--emerald-500', primaryColor);
    root.style.setProperty('--emerald-600', primaryColor);
    root.style.setProperty('--green-500', primaryColor);
    root.style.setProperty('--green-600', primaryColor);
  };

  // Aplicar cores quando as configurações são carregadas
  useEffect(() => {
    if (settings) {
      applyColorsToSystem(settings.primary_color, settings.secondary_color);
    }
  }, [settings]);

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
  };
};
