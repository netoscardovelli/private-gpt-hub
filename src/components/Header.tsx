
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { FlaskConical, LogOut, Settings, Users, Building, MessageSquare, BarChart3, FileText, HelpCircle, Import, Heart, Pill, Palette, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrganizationSelector from '@/components/multi-tenant/OrganizationSelector';
import { cn } from '@/lib/utils';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
          <div className="w-8 h-8 dynamic-primary-bg rounded-lg flex items-center justify-center color-transition">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FORMULA-AI</h1>
            <p className="text-xs text-slate-400">Assistente Farmacêutico IA</p>
          </div>
        </div>

        {/* Menu de Navegação */}
        <div className="flex-1 flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className="space-x-2">
              {/* 1. Chat */}
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-slate-300 hover:text-white cursor-pointer color-transition"
                  onClick={() => navigate('/')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* 2. Configurações */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-slate-300 hover:text-white color-transition">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    {/* 2.1 Fórmulas */}
                    <div className="row-span-3">
                      <div className="mb-3 text-sm font-medium text-slate-700">Fórmulas</div>
                      <div className="grid gap-2">
                        <NavigationMenuLink 
                          className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                          onClick={() => navigate('/formulas/import')}
                        >
                          <Import className="w-4 h-4 mr-3 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">Importação de Fórmulas</div>
                            <div className="text-xs text-slate-500">Importar fórmulas em lote</div>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink 
                          className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                          onClick={() => navigate('/formulas/favorites')}
                        >
                          <Heart className="w-4 h-4 mr-3 text-red-500" />
                          <div>
                            <div className="text-sm font-medium">Fórmulas Preferenciais</div>
                            <div className="text-xs text-slate-500">Suas fórmulas favoritas</div>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink 
                          className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                          onClick={() => navigate('/actives/favorites')}
                        >
                          <Pill className="w-4 h-4 mr-3 dynamic-primary" />
                          <div>
                            <div className="text-sm font-medium">Ativos Preferenciais</div>
                            <div className="text-xs text-slate-500">Ativos mais utilizados</div>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </div>
                    
                    {/* 2.2 Configuração Farmácia */}
                    <div className="row-span-3">
                      <div className="mb-3 text-sm font-medium text-slate-700">Configuração Farmácia</div>
                      <div className="grid gap-2">
                        <NavigationMenuLink 
                          className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                          onClick={() => navigate('/settings/customization')}
                        >
                          <Palette className="w-4 h-4 mr-3 text-purple-500" />
                          <div>
                            <div className="text-sm font-medium">Personalização do Sistema</div>
                            <div className="text-xs text-slate-500">Cores, logotipo e layout</div>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink 
                          className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                          onClick={() => navigate('/doctors')}
                        >
                          <UserPlus className="w-4 h-4 mr-3 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium">Cadastro de Médicos</div>
                            <div className="text-xs text-slate-500">Gerenciar médicos parceiros</div>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* 3. Analytics */}
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-slate-300 hover:text-white cursor-pointer color-transition"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* 4. Relatórios */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-slate-300 hover:text-white color-transition">
                  <FileText className="w-4 h-4 mr-2" />
                  Relatórios
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[350px]">
                    <NavigationMenuLink 
                      className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                      onClick={() => navigate('/reports/formulas')}
                    >
                      <FlaskConical className="w-4 h-4 mr-3 dynamic-primary" />
                      <div>
                        <div className="text-sm font-medium">Relatórios de Fórmulas</div>
                        <div className="text-xs text-slate-500">Estatísticas de fórmulas</div>
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                      onClick={() => navigate('/reports/doctors')}
                    >
                      <Users className="w-4 h-4 mr-3 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Relatórios de Médicos</div>
                        <div className="text-xs text-slate-500">Atividade dos médicos</div>
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                      onClick={() => navigate('/reports/financial')}
                    >
                      <Building className="w-4 h-4 mr-3 dynamic-primary" />
                      <div>
                        <div className="text-sm font-medium">Relatórios Financeiros</div>
                        <div className="text-xs text-slate-500">Custos e receitas</div>
                      </div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* 5. Ajuda */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-slate-300 hover:text-white color-transition">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ajuda
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[300px]">
                    <NavigationMenuLink 
                      className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                      onClick={() => navigate('/help/documentation')}
                    >
                      <FileText className="w-4 h-4 mr-3 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Documentação</div>
                        <div className="text-xs text-slate-500">Manual completo</div>
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                      onClick={() => navigate('/help/support')}
                    >
                      <MessageSquare className="w-4 h-4 mr-3 dynamic-primary" />
                      <div>
                        <div className="text-sm font-medium">Suporte</div>
                        <div className="text-xs text-slate-500">Fale conosco</div>
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink 
                      className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer color-transition"
                      onClick={() => navigate('/help/tutorials')}
                    >
                      <HelpCircle className="w-4 h-4 mr-3 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Tutoriais</div>
                        <div className="text-xs text-slate-500">Aprenda a usar</div>
                      </div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Admin (só para admins) */}
              {canAccessAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-slate-300 hover:text-white cursor-pointer color-transition"
                    onClick={() => navigate('/admin')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Admin
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
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
