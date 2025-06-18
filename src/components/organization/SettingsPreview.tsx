
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FlaskConical } from 'lucide-react';

interface SettingsPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  logoFile: File | null;
  currentLogoUrl?: string;
}

const SettingsPreview = ({
  primaryColor,
  secondaryColor,
  companyName,
  logoFile,
  currentLogoUrl
}: SettingsPreviewProps) => {
  const displayName = companyName || 'FORMULA-AI';
  
  // Criar URL temporária para preview do arquivo selecionado
  const previewLogoUrl = logoFile ? URL.createObjectURL(logoFile) : currentLogoUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Preview das Configurações
        </CardTitle>
        <CardDescription>
          Visualize como ficará a aparência do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview do Header */}
        <div className="p-4 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-xs text-slate-500 mb-3">Preview do Header</p>
          <div 
            className="p-4 rounded-lg text-white flex items-center justify-between"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
              backgroundColor: '#1e293b'
            }}
          >
            <div className="flex items-center space-x-3">
              {previewLogoUrl ? (
                <img 
                  src={previewLogoUrl} 
                  alt="Logo Preview" 
                  className="w-8 h-8 rounded-lg object-contain bg-white p-1"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold">{displayName}</h1>
                <p className="text-xs text-slate-400">Assistente Farmacêutico IA</p>
              </div>
            </div>
            <Badge style={{ backgroundColor: primaryColor }} className="text-white">
              admin
            </Badge>
          </div>
        </div>

        {/* Preview de Botões */}
        <div className="p-4 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-xs text-slate-500 mb-3">Preview dos Botões</p>
          <div className="flex gap-3 flex-wrap">
            <Button 
              style={{ backgroundColor: primaryColor }}
              className="text-white hover:opacity-90"
            >
              Botão Primário
            </Button>
            <Button 
              variant="outline"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor 
              }}
              className="hover:opacity-90"
            >
              Botão Secundário
            </Button>
            <Button 
              style={{ backgroundColor: secondaryColor }}
              className="text-white hover:opacity-90"
            >
              Botão Secundário
            </Button>
          </div>
        </div>

        {/* Preview de Cards */}
        <div className="p-4 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-xs text-slate-500 mb-3">Preview de Cards</p>
          <div className="bg-slate-800 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Estatísticas</h3>
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <FlaskConical 
                  className="w-4 h-4"
                  style={{ color: primaryColor }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-slate-400">Consultas este mês</p>
          </div>
        </div>

        {/* Informações de Cores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div 
              className="w-full h-16 rounded-lg mb-2"
              style={{ backgroundColor: primaryColor }}
            ></div>
            <p className="text-sm font-medium">Cor Primária</p>
            <p className="text-xs text-slate-500">{primaryColor}</p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-16 rounded-lg mb-2"
              style={{ backgroundColor: secondaryColor }}
            ></div>
            <p className="text-sm font-medium">Cor Secundária</p>
            <p className="text-xs text-slate-500">{secondaryColor}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPreview;
