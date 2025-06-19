
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrescriptionsList from '@/components/prescriptions/PrescriptionsList';
import CreatePrescription from '@/components/prescriptions/CreatePrescription';
import PrescriptionTemplates from '@/components/prescriptions/PrescriptionTemplates';
import DispensationCenter from '@/components/prescriptions/DispensationCenter';
import { 
  FileText, 
  Plus, 
  BookTemplate, 
  Pill,
  QrCode,
  Shield
} from 'lucide-react';

const PrescriptionsPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Prescrições Digitais</h1>
          <p className="text-slate-400">
            Sistema completo de prescrições digitais com assinatura eletrônica e rastreamento
          </p>
        </div>

        <Tabs defaultValue="prescriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Prescrições
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Prescrição
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <BookTemplate className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="dispensation" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Dispensação
            </TabsTrigger>
            <TabsTrigger value="signature" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Assinatura
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions">
            <PrescriptionsList />
          </TabsContent>

          <TabsContent value="create">
            <CreatePrescription />
          </TabsContent>

          <TabsContent value="templates">
            <PrescriptionTemplates />
          </TabsContent>

          <TabsContent value="dispensation">
            <DispensationCenter />
          </TabsContent>

          <TabsContent value="signature">
            <div className="text-center py-8 text-slate-400">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <p>Sistema de Assinatura Digital</p>
              <p className="text-sm mt-2">
                Integração com certificados A1/A3 em desenvolvimento
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrescriptionsPage;
