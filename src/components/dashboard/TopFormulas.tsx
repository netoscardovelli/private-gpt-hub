
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, TrendingUp } from 'lucide-react';

interface TopFormulasProps {
  formulas: Array<{
    name: string;
    category: string;
    usage_count: number;
    trend: number;
  }>;
}

const TopFormulas = ({ formulas }: TopFormulasProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-purple-500" />
          Fórmulas Mais Consultadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {formulas.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma consulta de fórmula ainda</p>
              <p className="text-slate-500 text-sm mt-1">
                As fórmulas mais consultadas aparecerão aqui
              </p>
            </div>
          ) : (
            formulas.map((formula, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{formula.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      {formula.category}
                    </Badge>
                    <span className="text-slate-500 text-xs">{formula.usage_count} consultas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-3 h-3 ${
                    formula.trend > 0 ? 'text-green-500' : 'text-slate-500'
                  }`} />
                  <span className={`text-xs font-medium ${
                    formula.trend > 0 ? 'text-green-500' : 'text-slate-500'
                  }`}>
                    {formula.trend > 0 ? '+' : ''}{formula.trend}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopFormulas;
