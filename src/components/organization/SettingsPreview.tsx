
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const previewStyle = {
    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
    borderColor: primaryColor 
  };

  return (
    <Card>
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
            {(logoFile && URL.createObjectURL(logoFile)) || currentLogoUrl ? (
              <img 
                src={logoFile ? URL.createObjectURL(logoFile) : currentLogoUrl} 
                alt="Logo" 
                className="w-12 h-12 rounded-lg object-contain"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName ? companyName.charAt(0).toUpperCase() : 'O'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
                {companyName || 'Nome da Organização'}
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
  );
};

export default SettingsPreview;
