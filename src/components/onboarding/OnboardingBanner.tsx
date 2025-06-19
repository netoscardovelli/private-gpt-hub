
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, X } from 'lucide-react';

const OnboardingBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Não mostrar se o usuário não está logado, já tem organização ou já dismissou
  if (!user || profile?.organization_id || dismissed) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500" />
          Crie sua Farmácia na Plataforma
        </CardTitle>
        <CardDescription className="text-slate-300">
          Configure sua farmácia para convidar médicos e ter controle total sobre fórmulas e relatórios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <h4 className="text-white font-medium">Benefícios do cadastro B2B:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Convite e gestão de médicos parceiros</li>
              <li>• Fórmulas personalizadas para sua farmácia</li>
              <li>• Relatórios exclusivos e analytics detalhados</li>
              <li>• Branding personalizado da sua farmácia</li>
            </ul>
          </div>
          <Button 
            onClick={() => navigate('/pharmacy-onboarding')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap"
          >
            Cadastrar Farmácia
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingBanner;
