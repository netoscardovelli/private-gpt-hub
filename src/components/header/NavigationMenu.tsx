
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Users,
  Heart,
  Upload,
  FileText,
  Building2,
  Palette
} from 'lucide-react';

const NavigationMenuComponent = () => {
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Visão geral da farmácia"
    },
    {
      title: "Chat IA",
      href: "/",
      icon: MessageSquare,
      description: "Assistente de formulação"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      description: "Métricas e análises"
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: FileText,
      description: "Relatórios avançados"
    }
  ];

  const managementItems = [
    {
      title: "Médicos Parceiros",
      href: "/doctors",
      icon: Users,
      description: "Gerenciar médicos parceiros"
    },
    {
      title: "Ativos Favoritos",
      href: "/actives-favorites", 
      icon: Heart,
      description: "Seus ativos preferidos"
    },
    {
      title: "Fórmulas Favoritas",
      href: "/formulas-favorites",
      icon: Heart,
      description: "Suas fórmulas preferidas"
    },
    {
      title: "Importar Fórmulas",
      href: "/formulas-import",
      icon: Upload,
      description: "Importar base de fórmulas"
    }
  ];

  const configItems = [
    {
      title: "Administração",
      href: "/admin",
      icon: Settings,
      description: "Configurações do sistema"
    },
    {
      title: "Onboarding",
      href: "/pharmacy-onboarding",
      icon: Building2,
      description: "Configurar farmácia"
    },
    {
      title: "Personalização",
      href: "/system-customization",
      icon: Palette,
      description: "Personalizar sistema"
    }
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Principal</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px]">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 rounded-lg p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Gerenciamento</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px]">
              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 rounded-lg p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Configurações</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px]">
              {configItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 rounded-lg p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavigationMenuComponent;
