
import { useState } from 'react';
import { usePrescriptionTemplates } from '@/hooks/usePrescriptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookTemplate, 
  Search, 
  Plus, 
  Eye,
  Star,
  Copy
} from 'lucide-react';

const PrescriptionTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: templates, isLoading } = usePrescriptionTemplates();

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 col-span-full">
            <CardContent className="text-center py-8">
              <BookTemplate className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-400">
                {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template cadastrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.is_default && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                {template.specialty && (
                  <Badge variant="secondary" className="w-fit">
                    {template.specialty}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Medicamentos:</p>
                    <p className="text-sm">
                      {template.template_data.items?.length || 0} item(s)
                    </p>
                  </div>

                  {template.template_data.clinical_indication && (
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Indicação:</p>
                      <p className="text-sm line-clamp-2">
                        {template.template_data.clinical_indication}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PrescriptionTemplates;
