
import { Button } from '@/components/ui/button';
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
import { 
  Settings, 
  Import, 
  Heart, 
  Pill, 
  Palette, 
  UserPlus, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  FlaskConical, 
  Users, 
  Building, 
  ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NavigationMenu = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const canAccessAdmin = profile?.role && ['admin', 'super_admin'].includes(profile.role);

  return (
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

        {/* Administration Menu */}
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
            {/* Formulas Section */}
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

            {/* Pharmacy Settings Section */}
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

            {/* Reports Submenu */}
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

            {/* Help Submenu */}
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

            {/* Admin Section (only for admins) */}
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
  );
};

export default NavigationMenu;
