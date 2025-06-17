
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Shield, XCircle, Info } from 'lucide-react';
import { ActiveData, DrugInteraction, getActiveData, findInteractions } from '@/data/pharmacologyData';

interface DoseAlert {
  activeName: string;
  currentDose: number;
  maxDose: number;
  unit: string;
  severity: 'warning' | 'danger';
  percentage: number;
}

interface PharmacySafetyAlertProps {
  messageContent: string;
}

const PharmacySafetyAlert = ({ messageContent }: PharmacySafetyAlertProps) => {
  // Extrair ativos e suas doses da mensagem
  const extractActivesAndDoses = (content: string): Array<{name: string, dose: number, unit: string}> => {
    const actives: Array<{name: string, dose: number, unit: string}> = [];
    
    // Padrões para capturar ativos com doses
    const patterns = [
      /• ([^:]+):\s*(\d+(?:\.\d+)?)\s*(mg|g|UI|mcg)/g,
      /([A-Za-zÀ-ÿ\s-]+)\s+(\d+(?:\.\d+)?)\s*(mg|g|UI|mcg)/g,
      /(\w+(?:\s+\w+)*)\s*:\s*(\d+(?:\.\d+)?)\s*(mg|g|UI|mcg)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let name = match[1].trim();
        let dose = parseFloat(match[2]);
        let unit = match[3].toLowerCase();

        // Converter para mg se necessário
        if (unit === 'g') dose *= 1000;
        if (unit === 'mcg') dose /= 1000;
        if (unit === 'ui') unit = 'UI'; // Manter UI para vitaminas

        // Limpar nome do ativo
        name = name.replace(/^•\s*/, '').replace(/:$/, '').trim();
        
        if (name && dose > 0) {
          actives.push({ name, dose, unit: unit === 'ui' ? 'UI' : 'mg' });
        }
      }
    });

    return actives;
  };

  const analyzeDoseSafety = (actives: Array<{name: string, dose: number, unit: string}>): DoseAlert[] => {
    const alerts: DoseAlert[] = [];

    actives.forEach(active => {
      const activeData = getActiveData(active.name);
      if (activeData) {
        const percentage = (active.dose / activeData.maxDailyDose) * 100;
        
        if (percentage > 100) {
          alerts.push({
            activeName: active.name,
            currentDose: active.dose,
            maxDose: activeData.maxDailyDose,
            unit: activeData.unit,
            severity: 'danger',
            percentage
          });
        } else if (percentage > 80) {
          alerts.push({
            activeName: active.name,
            currentDose: active.dose,
            maxDose: activeData.maxDailyDose,
            unit: activeData.unit,
            severity: 'warning',
            percentage
          });
        }
      }
    });

    return alerts;
  };

  const extractedActives = extractActivesAndDoses(messageContent);
  const doseAlerts = analyzeDoseSafety(extractedActives);
  const activeNames = extractedActives.map(a => a.name);
  const interactions = findInteractions(activeNames);

  // Se não há alertas, não mostrar o componente
  if (doseAlerts.length === 0 && interactions.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'contraindicada':
      case 'danger':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'grave':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'moderada':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'leve':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'contraindicada':
      case 'danger':
        return 'bg-red-900/30 border-red-600';
      case 'grave':
        return 'bg-red-800/30 border-red-500';
      case 'moderada':
      case 'warning':
        return 'bg-yellow-900/30 border-yellow-600';
      case 'leve':
        return 'bg-blue-900/30 border-blue-600';
      default:
        return 'bg-gray-800/30 border-gray-600';
    }
  };

  return (
    <Card className="bg-slate-800/80 border-red-600/50 mt-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-red-300">Análise de Segurança Farmacêutica</h3>
        <Badge className="bg-red-600/30 text-red-300">CRÍTICO</Badge>
      </div>

      <div className="space-y-4">
        {/* Alertas de Dose */}
        {doseAlerts.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-red-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas de Dosagem
            </h4>
            <div className="space-y-2">
              {doseAlerts.map((alert, index) => (
                <Alert key={index} className={`${getSeverityColor(alert.severity)} text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <AlertTitle className="text-white flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        {alert.activeName}
                        <Badge className={`${alert.severity === 'danger' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
                          {alert.percentage.toFixed(0)}% da dose máxima
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="text-gray-200 mt-2">
                        <strong>Dose prescrita:</strong> {alert.currentDose} {alert.unit}<br/>
                        <strong>Dose máxima diária:</strong> {alert.maxDose} {alert.unit}<br/>
                        {alert.severity === 'danger' && (
                          <span className="text-red-300 font-medium">
                            ⚠️ DOSE ACIMA DO LIMITE SEGURO - Ajustar prescrição!
                          </span>
                        )}
                        {alert.severity === 'warning' && (
                          <span className="text-yellow-300 font-medium">
                            ⚠️ Dose próxima ao limite - Monitorar paciente
                          </span>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Interações Medicamentosas */}
        {interactions.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-red-200 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Interações Medicamentosas Detectadas
            </h4>
            <div className="space-y-3">
              {interactions.map((interaction, index) => (
                <Alert key={index} className={`${getSeverityColor(interaction.severity)} text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <AlertTitle className="text-white flex items-center gap-2">
                        {getSeverityIcon(interaction.severity)}
                        {getActiveData(interaction.active1)?.name || interaction.active1} + {getActiveData(interaction.active2)?.name || interaction.active2}
                        <Badge className={`${
                          interaction.severity === 'contraindicada' ? 'bg-red-700' :
                          interaction.severity === 'grave' ? 'bg-red-600' :
                          interaction.severity === 'moderada' ? 'bg-yellow-600' : 'bg-blue-600'
                        } text-white`}>
                          {interaction.severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="text-gray-200 mt-2 space-y-1">
                        <div><strong>Descrição:</strong> {interaction.description}</div>
                        <div><strong>Mecanismo:</strong> {interaction.mechanism}</div>
                        <div><strong>Efeito clínico:</strong> {interaction.clinicalEffect}</div>
                        {interaction.severity === 'contraindicada' && (
                          <div className="text-red-300 font-medium mt-2">
                            🚫 COMBINAÇÃO CONTRAINDICADA - Remover um dos ativos!
                          </div>
                        )}
                        {interaction.severity === 'grave' && (
                          <div className="text-red-300 font-medium mt-2">
                            ⚠️ INTERAÇÃO GRAVE - Considerar alternativas ou monitoramento rigoroso
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-700/50 rounded border border-slate-600">
          <p className="text-xs text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            <strong>Importante:</strong> Esta análise é baseada em dados farmacológicos conhecidos. 
            Sempre considere o contexto clínico individual do paciente, condições médicas preexistentes 
            e outros medicamentos em uso. Em caso de dúvidas, consulte literatura especializada ou 
            farmacologista clínico.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PharmacySafetyAlert;
