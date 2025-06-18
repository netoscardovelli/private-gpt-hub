import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SystemSettings {
  id?: string;
  organization_id: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useSystemSettings = () => {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.organization_id) {
      loadSettings();
    }
  }, [user, profile?.organization_id]);

  const loadSettings = async () => {
    if (!user || !profile?.organization_id) return;

    setLoading(true);
    try {
      console.log('🔧 Carregando configurações para organização:', profile.organization_id);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('organization_id', profile.organization_id)
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
    if (!user || !profile?.organization_id) {
      console.error('❌ Usuário não autenticado ou sem organização');
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado ou sem organização selecionada.',
        variant: 'destructive',
      });
      return false;
    }

    // Verificar se o usuário tem permissão para editar configurações da organização
    if (!profile.role || !['admin', 'super_admin', 'owner'].includes(profile.role)) {
      toast({
        title: 'Erro',
        description: 'Você não tem permissão para alterar as configurações da organização.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('💾 Iniciando salvamento das configurações...');
      console.log('🏢 Organization ID:', profile.organization_id);
      console.log('🎨 Cores:', { primaryColor, secondaryColor });
      console.log('🏢 Nome da empresa:', companyName);
      
      let logoUrl = settings?.logo_url;

      // Upload do logo se um arquivo foi fornecido
      if (logoFile) {
        console.log('📁 Fazendo upload do logo...');
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${profile.organization_id}-${Date.now()}.${fileExt}`;
        
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
        organization_id: profile.organization_id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        company_name: companyName,
        logo_url: logoUrl,
      };

      console.log('💾 Dados para salvar:', settingsData);

      let result;
      if (settings?.id) {
        console.log('🔄 Atualizando configurações existentes...');
        result = await supabase
          .from('system_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        console.log('🆕 Criando novas configurações...');
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
      setSettings(result.data);
      
      // Aplicar as cores e nome ao sistema
      applySystemSettings(primaryColor, secondaryColor, companyName, logoUrl);
      
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

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applySystemSettings = (primaryColor: string, secondaryColor: string, companyName: string, logoUrl?: string) => {
    console.log('🎨 Aplicando configurações ao sistema:', { primaryColor, secondaryColor, companyName, logoUrl });
    
    const root = document.documentElement;
    
    // Converter cores hex para HSL
    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);
    
    // Aplicar as cores principais do sistema usando as variáveis CSS do shadcn/ui
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    
    // Cores secundárias
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--secondary-foreground', primaryHsl);
    
    // Aplicar nos elementos específicos do sistema
    root.style.setProperty('--emerald-500', primaryColor);
    root.style.setProperty('--emerald-600', primaryColor);
    root.style.setProperty('--green-500', primaryColor);
    root.style.setProperty('--green-600', primaryColor);
    
    // Aplicar nome da empresa globalmente
    root.style.setProperty('--company-name', `"${companyName}"`);
    
    // Adicionar classes CSS dinâmicas para sobrescrever estilos específicos
    const existingStyle = document.getElementById('dynamic-system-settings');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-system-settings';
    styleElement.innerHTML = `
      /* Sobrescrever cores específicas do sistema */
      .bg-emerald-500, .bg-green-500 {
        background-color: ${primaryColor} !important;
      }
      
      .bg-emerald-600, .bg-green-600 {
        background-color: ${primaryColor} !important;
      }
      
      .text-emerald-500, .text-green-500 {
        color: ${primaryColor} !important;
      }
      
      .border-emerald-500, .border-green-500 {
        border-color: ${primaryColor} !important;
      }
      
      /* Header gradient */
      .bg-slate-800 {
        background: linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20) !important;
      }
      
      /* Botões primários */
      .bg-primary {
        background-color: ${primaryColor} !important;
      }
      
      .bg-primary\\/90:hover {
        background-color: ${primaryColor}e6 !important;
      }
      
      /* Navigation menu items */
      .hover\\:bg-accent:hover {
        background-color: ${primaryColor}20 !important;
      }
      
      /* Cards e componentes */
      .bg-gradient-to-r.from-emerald-500.to-green-600 {
        background: linear-gradient(to right, ${primaryColor}, ${secondaryColor}) !important;
      }
      
      /* Nome da empresa - aplicar globalmente */
      .dynamic-company-name::before {
        content: "${companyName}";
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Criar evento customizado para notificar mudança nas configurações
    const event = new CustomEvent('systemSettingsChanged', {
      detail: { primaryColor, secondaryColor, companyName, logoUrl }
    });
    window.dispatchEvent(event);
    
    console.log('✅ Configurações aplicadas ao sistema');
  };

  // Aplicar configurações quando são carregadas
  useEffect(() => {
    if (settings) {
      applySystemSettings(settings.primary_color, settings.secondary_color, settings.company_name, settings.logo_url);
    }
  }, [settings]);

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
  };
};
