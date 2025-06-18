
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload } from 'lucide-react';

interface VisualIdentitySettingsProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  canEdit: boolean;
  currentLogoUrl?: string;
}

const VisualIdentitySettings = ({
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  logoFile,
  setLogoFile,
  companyName,
  setCompanyName,
  canEdit,
  currentLogoUrl
}: VisualIdentitySettingsProps) => {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 Arquivo selecionado:', file.name);
      setLogoFile(file);
    }
  };

  return (
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
                disabled={!canEdit}
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#10b981"
                className="flex-1"
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
                disabled={!canEdit}
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
            Logotipo da Organização
          </CardTitle>
          <CardDescription>
            Faça upload do logo da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Nome da Organização</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Digite o nome da sua organização"
              className="mt-2"
              disabled={!canEdit}
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
              ) : currentLogoUrl ? (
                <div>
                  <img 
                    src={currentLogoUrl} 
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
                disabled={!canEdit}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={!canEdit}
              >
                {logoFile || currentLogoUrl ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualIdentitySettings;
