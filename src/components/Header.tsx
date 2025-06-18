
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, LogOut, Settings, Users, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrganizationSelector from '@/components/multi-tenant/OrganizationSelector';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const canAccessAdmin = profile?.role && ['admin', 'super_admin'].includes(profile.role);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FORMULA-AI</h1>
            <p className="text-xs text-slate-400">Assistente Farmacêutico IA</p>
          </div>
        </div>

        {/* Área Central - Seletor de Organização */}
        <div className="flex-1 flex justify-center">
          <OrganizationSelector />
        </div>

        {/* Área de Usuário */}
        <div className="flex items-center space-x-4">
          {/* Navegação */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white"
            >
              Chat
            </Button>
            
            {canAccessAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-slate-300 hover:text-white"
              >
                <Users className="w-4 h-4 mr-1" />
                Admin
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="text-slate-300 hover:text-white"
            >
              Analytics
            </Button>
          </div>

          {/* Info do Usuário */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {profile?.full_name || 'Usuário'}
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {profile?.role || 'user'}
                </Badge>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-400"
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
