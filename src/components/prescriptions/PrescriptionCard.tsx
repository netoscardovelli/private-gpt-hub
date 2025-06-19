
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CopyButton from '@/components/ui/copy-button';
import { 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  Eye,
  Download
} from 'lucide-react';
import type { Prescription } from '@/types/prescriptions';

interface PrescriptionCardProps {
  prescription: Prescription;
  onView?: (prescription: Prescription) => void;
  onDownload?: (prescription: Prescription) => void;
}

const PrescriptionCard = ({ prescription, onView, onDownload }: PrescriptionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'dispensed': return 'bg-blue-500';
      case 'expired': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'dispensed': return 'Dispensada';
      case 'expired': return 'Expirada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Preparar texto formatado para cópia
  const prescriptionText = `
PRESCRIÇÃO DIGITAL #${prescription.prescription_number}

Paciente: ${prescription.patient_name}
CPF: ${prescription.patient_cpf}
Data de Nascimento: ${new Date(prescription.patient_birth_date).toLocaleDateString('pt-BR')}

Endereço:
${prescription.patient_address.street}, ${prescription.patient_address.number}
${prescription.patient_address.complement ? prescription.patient_address.complement + '\n' : ''}${prescription.patient_address.neighborhood}
${prescription.patient_address.city} - ${prescription.patient_address.state}
CEP: ${prescription.patient_address.zip_code}

Data da Prescrição: ${new Date(prescription.prescription_date).toLocaleDateString('pt-BR')}
Validade: ${new Date(prescription.validity_date).toLocaleDateString('pt-BR')}

${prescription.clinical_indication ? `Indicação Clínica: ${prescription.clinical_indication}\n` : ''}
${prescription.special_instructions ? `Instruções Especiais: ${prescription.special_instructions}\n` : ''}

Status: ${getStatusLabel(prescription.status)}
`.trim();

  const patientInfo = `${prescription.patient_name} - CPF: ${prescription.patient_cpf}`;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              #{prescription.prescription_number}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(prescription.status)}>
                {getStatusLabel(prescription.status)}
              </Badge>
              {prescription.controlled_medication && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  Controlado
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <CopyButton 
              text={prescriptionText}
              label="Copiar"
              size="sm"
              className="text-slate-400 hover:text-white"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4" />
          <span className="text-sm">{prescription.patient_name}</span>
          <CopyButton 
            text={patientInfo}
            label=""
            size="sm"
            className="h-6 w-6 p-0"
            showIcon={true}
          />
        </div>
        
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {prescription.patient_address.city} - {prescription.patient_address.state}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Válida até: {new Date(prescription.validity_date).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {prescription.clinical_indication && (
          <div className="bg-slate-700 p-3 rounded-lg">
            <p className="text-sm text-slate-300 mb-2">Indicação Clínica:</p>
            <p className="text-sm text-white">{prescription.clinical_indication}</p>
            <CopyButton 
              text={prescription.clinical_indication}
              label="Copiar Indicação"
              size="sm"
              className="mt-2"
            />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onView && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onView(prescription)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
          )}
          {onDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDownload(prescription)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;
