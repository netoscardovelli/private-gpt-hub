
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Search, 
  QrCode, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const DispensationCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);

  // Mock data - seria substituído por dados reais
  const pendingDispensations = [
    {
      id: '1',
      prescription_number: 'RX-2024-000001',
      patient_name: 'João Silva',
      items: [
        { name: 'Dipirona 500mg', quantity: 30, dispensed: 0 },
        { name: 'Paracetamol 750mg', quantity: 20, dispensed: 0 }
      ],
      controlled: false,
      urgent: false
    },
    {
      id: '2',
      prescription_number: 'RX-2024-000002',
      patient_name: 'Maria Santos',
      items: [
        { name: 'Diazepam 10mg', quantity: 30, dispensed: 0 }
      ],
      controlled: true,
      urgent: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por número da prescrição ou QR Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Button variant="outline">
          <QrCode className="w-4 h-4 mr-2" />
          Escanear QR
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Dispensações Pendentes */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Dispensações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDispensations.map((prescription) => (
                <div
                  key={prescription.id}
                  className="p-4 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50"
                  onClick={() => setSelectedPrescription(prescription.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prescription.prescription_number}</h4>
                    <div className="flex items-center gap-2">
                      {prescription.controlled && (
                        <Badge variant="destructive">Controlado</Badge>
                      )}
                      {prescription.urgent && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{prescription.patient_name}</p>
                  <div className="space-y-1">
                    {prescription.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-slate-400">
                          {item.dispensed}/{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Dispensação */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Centro de Dispensação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPrescription ? (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium mb-2">Prescrição Selecionada</p>
                  <p className="text-slate-400">RX-2024-000001</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Dipirona 500mg</span>
                      <span className="text-sm text-slate-400">30 unidades</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="Quantidade dispensada"
                      className="bg-slate-600 border-slate-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Paracetamol 750mg</span>
                      <span className="text-sm text-slate-400">20 unidades</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="Quantidade dispensada"
                      className="bg-slate-600 border-slate-500"
                    />
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Dispensação
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Pill className="w-12 h-12 mx-auto mb-4" />
                <p>Selecione uma prescrição para dispensar</p>
                <p className="text-sm mt-2">
                  ou escaneie o QR Code da prescrição
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispensationCenter;
