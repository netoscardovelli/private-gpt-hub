
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Mail, Phone, MapPin, Settings, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrganizationInfoProps {
  organizationData: any;
}

const OrganizationInfo = ({ organizationData }: OrganizationInfoProps) => {
  const navigate = useNavigate();

  if (!organizationData) return null;

  const planTypeMap = {
    'free': { label: 'Gratuito', color: 'bg-gray-500' },
    'pro': { label: 'Profissional', color: 'bg-emerald-500' },
    'enterprise': { label: 'Enterprise', color: 'bg-purple-500' }
  };

  const currentPlan = planTypeMap[organizationData.plan_type as keyof typeof planTypeMap] || planTypeMap.free;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-500" />
            Informações da Farmácia
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/customization')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{organizationData.name}</h3>
          <Badge className={`${currentPlan.color} text-white`}>
            <Crown className="w-3 h-3 mr-1" />
            {currentPlan.label}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4" />
              <span>{organizationData.contact_email}</span>
            </div>
            
            {organizationData.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4" />
                <span>{organizationData.phone}</span>
              </div>
            )}
            
            {organizationData.address && (
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4" />
                <span>{organizationData.address}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400">ID do Sistema:</span>
              <p className="text-slate-300 font-mono text-xs">{organizationData.slug}</p>
            </div>
            
            <div>
              <span className="text-slate-400">Criada em:</span>
              <p className="text-slate-300">
                {new Date(organizationData.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {organizationData.description && (
          <div className="mt-4">
            <span className="text-slate-400">Descrição:</span>
            <p className="text-slate-300 mt-1">{organizationData.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrganizationInfo;
