
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PrescriptionCard from './PrescriptionCard';
import { fetchPrescriptionsApi } from '@/services/prescriptionsService';
import { Search, Filter, FileText } from 'lucide-react';
import type { Prescription } from '@/types/prescriptions';

const PrescriptionsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: prescriptions = [], isLoading, error } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => fetchPrescriptionsApi(),
  });

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patient_cpf.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return prescriptions.reduce((acc, prescription) => {
      acc[prescription.status] = (acc[prescription.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  const handleViewPrescription = (prescription: Prescription) => {
    console.log('Visualizar prescrição:', prescription);
    // Implementar modal ou navegação para visualização detalhada
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    console.log('Download prescrição:', prescription);
    // Implementar geração de PDF
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Erro ao carregar prescrições: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{prescriptions.length}</p>
              </div>
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ativas</p>
                <p className="text-2xl font-bold text-green-500">{statusCounts.active || 0}</p>
              </div>
              <Badge className="bg-green-500">Ativas</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Dispensadas</p>
                <p className="text-2xl font-bold text-blue-500">{statusCounts.dispensed || 0}</p>
              </div>
              <Badge className="bg-blue-500">Dispensadas</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Expiradas</p>
                <p className="text-2xl font-bold text-red-500">{statusCounts.expired || 0}</p>
              </div>
              <Badge className="bg-red-500">Expiradas</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por paciente, número da prescrição ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="dispensed">Dispensadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prescrições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrescriptions.map((prescription) => (
          <PrescriptionCard
            key={prescription.id}
            prescription={prescription}
            onView={handleViewPrescription}
            onDownload={handleDownloadPrescription}
          />
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma prescrição encontrada com os filtros aplicados.'
                : 'Nenhuma prescrição encontrada.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionsList;
