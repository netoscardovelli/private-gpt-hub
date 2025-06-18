
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrganizationSelector from '@/components/multi-tenant/OrganizationSelector';

const UserSection = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Organization Selector */}
      <OrganizationSelector />

      {/* User Info */}
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
  );
};

export default UserSection;
