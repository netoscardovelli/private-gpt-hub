
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Save, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const SystemCustomizationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, saveSettings } = useSystemSettings();
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 Arquivo selecionado:', file.name);
      setLogoFile(file);
    }
  };

  const handleSave = async () => {
    console.log('💾 Iniciando salvamento...');
    setIsSaving(true);
    const success = await saveSettings(primaryColor, secondaryColor, companyName, logoFile);
    if (success) {
      setLogoFile(null); // Limpar o arquivo após salvamento bem-sucedido
      console.log('✅ Salvamento concluído com sucesso');
    } else {
      console.log('❌ Erro no salvamento');
    }
    setIsSaving(false);
  };

  const previewStyle = {
    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
    borderColor: primaryColor 
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Personalização do Sistema</h1>
          <p className="text-slate-300">Configure a aparência e identidade visual da sua farmácia</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuração de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Esquema de Cores
              </CardTitle>
              <CardDescription>
                Personalize as cores principais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload de Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logotipo da Farmácia
              </CardTitle>
              <CardDescription>
                Faça upload do logo da sua farmácia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Nome da Farmácia</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Digite o nome da sua farmácia"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="logo-upload">Logo (PNG, JPG ou SVG)</Label>
                <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  {logoFile ? (
                    <div>
                      <p className="text-sm text-green-600 mb-2">✓ {logoFile.name}</p>
                      <p className="text-xs text-slate-500">Arquivo selecionado</p>
                    </div>
                  ) : settings?.logo_url ? (
                    <div>
                      <img 
                        src={settings.logo_url} 
                        alt="Logo atual" 
                        className="w-16 h-16 mx-auto mb-2 object-contain"
                      />
                      <p className="text-xs text-slate-500">Logo atual</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Clique para selecionar ou arraste o arquivo</p>
                    </div>
                  )}
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    {logoFile || settings?.logo_url ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Preview das Configurações</CardTitle>
              <CardDescription>
                Visualize como ficará a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="p-6 rounded-lg border-2" 
                style={previewStyle}
              >
                <div className="flex items-center gap-3 mb-4">
                  {(logoFile && URL.createObjectURL(logoFile)) || settings?.logo_url ? (
                    <img 
                      src={logoFile ? URL.createObjectURL(logoFile) : settings?.logo_url} 
                      alt="Logo" 
                      className="w-12 h-12 rounded-lg object-contain"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {companyName ? companyName.charAt(0).toUpperCase() : 'F'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
                      {companyName || 'Nome da Farmácia'}
                    </h3>
                    <p className="text-sm text-slate-600">Assistente Farmacêutico IA</p>
                  </div>
                </div>
                
                <Button 
                  style={{ backgroundColor: primaryColor }}
                  className="text-white mr-2"
                >
                  Botão Primário
                </Button>
                <Button 
                  variant="outline"
                  style={{ borderColor: secondaryColor, color: secondaryColor }}
                >
                  Botão Secundário
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Salvar */}
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
      </div>
    </div>
  );
};

export default SystemCustomizationPage;
