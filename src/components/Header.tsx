
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { FlaskConical, LogOut, Settings, Users, Building, MessageSquare, BarChart3, FileText, HelpCircle, Import, Heart, Pill, Palette, UserPlus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrganizationSelector from '@/components/multi-tenant/OrganizationSelector';
import { cn } from '@/lib/utils';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useState, useEffect } from 'react';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const [dynamicSettings, setDynamicSettings] = useState<any>(null);

  // Escutar mudanças nas configurações do sistema
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setDynamicSettings(event.detail);
    };

    window.addEventListener('systemSettingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('systemSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  // Usar configurações dinâmicas se disponíveis, senão usar as configurações carregadas
  const currentSettings = dynamicSettings || settings;
  const companyName = currentSettings?.company_name || 'FORMULA-AI';
  const logoUrl = currentSettings?.logo_url;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const canAccessAdmin = profile?.role && ['admin', 'super_admin'].includes(profile.role);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 color-transition">
      <div className="flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center space-x-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-contain"
            />
          ) : (
            <div className="w-8 h-8 dynamic-primary-bg rounded-lg flex items-center justify-center color-transition">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{companyName}</h1>
            <p className="text-xs text-slate-400">Assistente Farmacêutico IA</p>
          </div>
        </div>

        {/* Menu de Navegação */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-4">
            {/* Chat */}
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white color-transition"
              onClick={() => navigate('/')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>

            {/* Menu Administração */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white color-transition"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administração
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                {/* Fórmulas */}
                <DropdownMenuLabel>Fórmulas</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/formulas/import')}>
                  <Import className="w-4 h-4 mr-2 text-blue-500" />
                  Importação de Fórmulas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/formulas/favorites')}>
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Fórmulas Preferenciais
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/actives/favorites')}>
                  <Pill className="w-4 h-4 mr-2 dynamic-primary" />
                  Ativos Preferenciais
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Configurações da Farmácia */}
                <DropdownMenuLabel>Configurações da Farmácia</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/settings/customization')}>
                  <Palette className="w-4 h-4 mr-2 text-purple-500" />
                  Personalização do Sistema
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/doctors')}>
                  <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                  Cadastro de Médicos
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Analytics */}
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2 dynamic-primary" />
                  Analytics
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Relatórios */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FileText className="w-4 h-4 mr-2" />
                    Relatórios
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => navigate('/reports/formulas')}>
                      <FlaskConical className="w-4 h-4 mr-2 dynamic-primary" />
                      Relatórios de Fórmulas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/reports/doctors')}>
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      Relatórios de Médicos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/reports/financial')}>
                      <Building className="w-4 h-4 mr-2 dynamic-primary" />
                      Relatórios Financeiros
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Ajuda */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Ajuda
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => navigate('/help/documentation')}>
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Documentação
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/help/support')}>
                      <MessageSquare className="w-4 h-4 mr-2 dynamic-primary" />
                      Suporte
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/help/tutorials')}>
                      <HelpCircle className="w-4 h-4 mr-2 text-purple-500" />
                      Tutoriais
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Admin (só para admins) */}
                {canAccessAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Users className="w-4 h-4 mr-2 text-orange-500" />
                      Painel Administrativo
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Área de Usuário e Organização */}
        <div className="flex items-center space-x-4">
          {/* Seletor de Organização */}
          <OrganizationSelector />

          {/* Info do Usuário */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {profile?.full_name || 'Usuário'}
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs color-transition">
                  {profile?.role || 'user'}
                </Badge>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-400 color-transition"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
