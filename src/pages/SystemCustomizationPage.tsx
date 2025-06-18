
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Shield, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import OrganizationManagement from '@/components/organization/OrganizationManagement';
import VisualIdentitySettings from '@/components/organization/VisualIdentitySettings';
import SettingsPreview from '@/components/organization/SettingsPreview';

const SystemCustomizationPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, saveSettings } = useSystemSettings();
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Verificar se o usuário tem permissão para editar configurações
  const canEdit = profile?.role && ['admin', 'super_admin', 'owner'].includes(profile.role);

  // Carregar configurações existentes quando disponíveis
  useEffect(() => {
    if (settings) {
      console.log('📋 Carregando configurações na interface:', settings);
      setPrimaryColor(settings.primary_color || '#10b981');
      setSecondaryColor(settings.secondary_color || '#6366f1');
      setCompanyName(settings.company_name || '');
    }
  }, [settings]);

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.organization_id) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Personalização do Sistema</h1>
            <p className="text-slate-300">Configure a aparência e identidade visual da sua organização</p>
          </div>
          
          <Alert>
            <Building className="h-4 w-4" />
            <AlertDescription>
              Você precisa estar vinculado a uma organização para acessar as configurações do sistema.
              Use a seção abaixo para criar uma nova organização ou selecionar uma existente.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6">
            <OrganizationManagement />
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    console.log('💾 Iniciando salvamento...');
    setIsSaving(true);
    const success = await saveSettings(primaryColor, secondaryColor, companyName, logoFile);
    if (success) {
      setLogoFile(null);
      console.log('✅ Salvamento concluído com sucesso');
    } else {
      console.log('❌ Erro no salvamento');
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Personalização do Sistema</h1>
          <p className="text-slate-300">Configure a aparência e identidade visual da sua organização</p>
        </div>

        {!canEdit && (
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Apenas administradores da organização podem alterar as configurações do sistema. 
              Entre em contato com o administrador da sua organização para fazer alterações.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-8">
          {/* Seção 1: Gerenciamento de Organização */}
          <OrganizationManagement />

          {/* Seção 2: Identidade Visual */}
          <VisualIdentitySettings
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            logoFile={logoFile}
            setLogoFile={setLogoFile}
            companyName={companyName}
            setCompanyName={setCompanyName}
            canEdit={canEdit}
            currentLogoUrl={settings?.logo_url}
          />

          {/* Seção 3: Preview */}
          <SettingsPreview
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            companyName={companyName}
            logoFile={logoFile}
            currentLogoUrl={settings?.logo_url}
          />
        </div>

        {/* Botão Salvar */}
        {canEdit && (
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !companyName.trim()}
              style={{ backgroundColor: primaryColor }}
              className="text-white hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemCustomizationPage;
