
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PermissionCheckProps {
  hasOrganization: boolean;
  hasPermission: boolean;
  userRole?: string;
  error?: any;
  children: React.ReactNode;
}

const PermissionCheck = ({ 
  hasOrganization, 
  hasPermission, 
  userRole, 
  error, 
  children 
}: PermissionCheckProps) => {
  if (!hasOrganization) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa estar associado a uma organização para gerenciar convites de médicos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para gerenciar convites de médicos. 
              Role atual: <strong>{userRole || 'não definido'}</strong>. 
              Roles necessários: admin, super_admin ou owner.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default PermissionCheck;
