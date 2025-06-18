
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Shield, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrganizationSelector from '@/components/multi-tenant/OrganizationSelector';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { currentRole, hasPermission } = useRoles();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      user: 'secondary',
      moderator: 'default',
      admin: 'destructive',
      super_admin: 'destructive',
      partner: 'outline'
    };
    return colors[role as keyof typeof colors] || 'secondary';
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FA</span>
            </div>
            <span className="text-xl font-bold text-emerald-700">FORMULA-AI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Chat
            </Link>
            
            {hasPermission('canAccessAnalytics') && (
              <Link to="/analytics" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Analytics
              </Link>
            )}
            
            {hasPermission('canManageOrganizations') && (
              <Link to="/admin" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Organization Selector */}
                <OrganizationSelector />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <div className="pt-1">
                        <Badge variant={getRoleColor(currentRole)} className="text-xs">
                          {currentRole}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>

                    {hasPermission('canManageOrganizations') && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Painel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
