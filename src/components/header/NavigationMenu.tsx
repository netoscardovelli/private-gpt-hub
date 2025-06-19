
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Menu,
  Heart,
  Upload,
  Building2,
  Palette,
  Bell,
  Plug
} from 'lucide-react';

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Relatórios' },
    { to: '/doctors', icon: Users, label: 'Médicos' },
    { to: '/prescriptions', icon: FileText, label: 'Prescrições' },
    { to: '/actives-favorites', icon: Heart, label: 'Ativos Favoritos' },
    { to: '/formulas-favorites', icon: Heart, label: 'Fórmulas Favoritas' },
    { to: '/formulas-import', icon: Upload, label: 'Importar Fórmulas' },
    { to: '/pharmacy-onboarding', icon: Building2, label: 'Onboarding' },
    { to: '/system-customization', icon: Palette, label: 'Personalização' },
    { to: '/notifications', icon: Bell, label: 'Notificações' },
    { to: '/api-management', icon: Plug, label: 'APIs' },
    { to: '/admin', icon: Settings, label: 'Admin' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavigationItems = () => (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.to)
                ? 'bg-white/10 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        <NavigationItems />
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-slate-900 border-slate-800">
          <div className="flex flex-col space-y-2 mt-8">
            <NavigationItems />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NavigationMenu;
