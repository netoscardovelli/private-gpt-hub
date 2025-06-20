
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    pending: { label: 'Pendente', variant: 'default' as const },
    accepted: { label: 'Aceito', variant: 'secondary' as const },
    expired: { label: 'Expirado', variant: 'destructive' as const },
    cancelled: { label: 'Cancelado', variant: 'outline' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StatusBadge;
