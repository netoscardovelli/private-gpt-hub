
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Menu, X, Settings, CreditCard, MessageCircle } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  user?: { name: string; email: string; plan: string };
  onLogin: () => void;
  onLogout: () => void;
  onSettingsClick: () => void;
  onBillingClick?: () => void;
  onChatClick?: () => void;
  onSupportClick: () => void;
  userName?: string;
}

const Header = ({ 
  isAuthenticated, 
  user, 
  onLogin, 
  onLogout, 
  onSettingsClick, 
  onBillingClick = () => {}, 
  onChatClick = () => {}, 
  onSupportClick,
  userName 
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = userName || user?.name;
  const displayPlan = user?.plan || "Free";

  return (
    <header className="bg-white border-b border-emerald-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="text-xl font-bold text-emerald-700">FORMULA-AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-emerald-600">
                  Plano: <span className="text-emerald-700 font-semibold">{displayPlan}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onChatClick}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBillingClick}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinatura
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm">
                      {displayName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={onLogin} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white">
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-emerald-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-emerald-200 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-sm text-emerald-600">
                  Plano: <span className="text-emerald-700 font-semibold">{displayPlan}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onChatClick}
                  className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBillingClick}
                  className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinatura
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white">
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
