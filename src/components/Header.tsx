
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Menu, X, Settings, CreditCard } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  user?: { name: string; email: string; plan: string };
  onLogin: () => void;
  onLogout: () => void;
  onSettingsClick: () => void;
  onBillingClick: () => void;
}

const Header = ({ isAuthenticated, user, onLogin, onLogout, onSettingsClick, onBillingClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="text-xl font-bold text-white">Formula.AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-300">
                  Plano: <span className="text-blue-400 font-semibold">{user?.plan}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="text-slate-300 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBillingClick}
                  className="text-slate-300 hover:text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinatura
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-slate-300 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={onLogin} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-700 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-300">
                  Plano: <span className="text-blue-400 font-semibold">{user?.plan}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="w-full justify-start text-slate-300 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBillingClick}
                  className="w-full justify-start text-slate-300 hover:text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinatura
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start text-slate-300 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Entrar
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
