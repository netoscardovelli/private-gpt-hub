import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DRUG_DATABASE, DRUG_INTERACTIONS, DrugInfo } from '@/data/pharmacologyData';
import { ShieldAlert, ShieldCheck, Info } from 'lucide-react';

interface ParsedActive {
  name: string;
  dose: number;
  unit: string;
}

interface SafetyAlert {
  type: 'critical' | 'warning' | 'caution' | 'info';
  title: string;
  message: string;
  active: string;
  recommendation: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  description: string;
}

interface SafetyAnalysis {
  alerts: SafetyAlert[];
  interactions: DrugInteraction[];
}

interface PharmacySafetyAlertProps {
  messageContent: string;
}

const PharmacySafetyAlert = ({ messageContent }: PharmacySafetyAlertProps) => {
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysis>({ alerts: [], interactions: [] });

  const parseActivesFromText = (text: string): ParsedActive[] => {
    const actives: ParsedActive[] = [];
    const regex = /•\s*([A-Za-zÀ-ú\s]+)\s*(\d+(?:\.\d+)?)\s*(mg|mcg|UI|g)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const dose = parseFloat(match[2]);
      const unit = match[3];

      actives.push({ name, dose, unit });
    }

    return actives;
  };

  useEffect(() => {
    const actives = parseActivesFromText(messageContent);
    const analysis = analyzeSafety(actives);
    setSafetyAnalysis(analysis);
  }, [messageContent]);

  const analyzeSafety = (actives: ParsedActive[]): SafetyAnalysis => {
    const alerts: SafetyAlert[] = [];
    const interactions: DrugInteraction[] = [];

    actives.forEach((active, index) => {
      const drugKey = active.name.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Tentar várias variações do nome
      const possibleKeys = [
        drugKey,
        drugKey.replace(/\s+/g, ''),
        drugKey.split(' ')[0],
        drugKey.replace('acido', 'ácido').replace('ácido', 'acido')
      ];

      let drugInfo = null;
      for (const key of possibleKeys) {
        if (DRUG_DATABASE[key]) {
          drugInfo = DRUG_DATABASE[key];
          break;
        }
      }

      if (drugInfo) {
        const percentage = (active.dose / drugInfo.maxDailyDose) * 100;

        // ALERTA CRÍTICO: Dose muito acima do máximo (como Saw Palmetto 2000mg)
        if (percentage > 600) {
          alerts.push({
            type: 'critical',
            title: '🚨 DOSE EXTREMAMENTE PERIGOSA',
            message: `${active.name} ${active.dose}${active.unit} está ${Math.round(percentage/100)}x ACIMA da dose máxima segura (${drugInfo.maxDailyDose}${drugInfo.unit}/dia). RISCO GRAVE DE TOXICIDADE!`,
            active: active.name,
            recommendation: `Reduzir imediatamente para no máximo ${drugInfo.maxDailyDose}${drugInfo.unit}/dia. Consultar literatura médica.`
          });
        }
        // Dose muito alta (200-600% do máximo)
        else if (percentage > 200) {
          alerts.push({
            type: 'critical',
            title: '⚠️ DOSE MUITO ACIMA DO SEGURO',
            message: `${active.name} ${active.dose}${active.unit} está ${Math.round(percentage)}% acima da dose máxima segura (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
            active: active.name,
            recommendation: `Reduzir para no máximo ${drugInfo.maxDailyDose}${drugInfo.unit}/dia. Doses recomendadas: ${drugInfo.commonDoses.join(', ')}${drugInfo.unit}`
          });
        }
        // Dose alta (100-200% do máximo)
        else if (percentage > 100) {
          alerts.push({
            type: 'warning',
            title: '⚠️ Dose acima do limite máximo',
            message: `${active.name} ${active.dose}${active.unit} excede a dose máxima recomendada (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
            active: active.name,
            recommendation: `Considerar reduzir para ${drugInfo.maxDailyDose}${drugInfo.unit}/dia ou menos`
          });
        }
        // Dose próxima do limite (80-100% do máximo)
        else if (percentage > 80) {
          alerts.push({
            type: 'caution',
            title: '⚡ Dose próxima do limite',
            message: `${active.name} ${active.dose}${active.unit} está próximo da dose máxima (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
            active: active.name,
            recommendation: 'Monitorar tolerabilidade do paciente'
          });
        }

        if (drugInfo.warnings && drugInfo.warnings.length > 0) {
          alerts.push({
            type: 'warning',
            title: '❗ Precauções importantes',
            message: `${active.name}: ${drugInfo.warnings.join(', ')}`,
            active: active.name,
            recommendation: 'Ajustar a dose ou monitorar o paciente'
          });
        }

        if (drugInfo.interactions && drugInfo.interactions.length > 0) {
          drugInfo.interactions.forEach(interactionDrug => {
            const interactedActive = actives.find(otherActive => {
              const otherDrugKey = otherActive.name.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              return otherDrugKey.includes(interactionDrug);
            });

            if (interactedActive) {
              interactions.push({
                drug1: active.name,
                drug2: interactedActive.name,
                description: DRUG_INTERACTIONS[drugKey]?.[interactionDrug] || `Interação entre ${active.name} e ${interactedActive.name}`
              });
            }
          });
        }
      } else {
        // Ativo não encontrado na base de dados
        alerts.push({
          type: 'info',
          title: '📋 Ativo não catalogado',
          message: `${active.name} não está na nossa base de dados de segurança farmacológica`,
          active: active.name,
          recommendation: 'Verificar dosagem na literatura médica especializada'
        });
      }
    });

    return { alerts, interactions };
  };

  const hasCriticalAlerts = safetyAnalysis.alerts.some(alert => alert.type === 'critical');
  const hasAlerts = safetyAnalysis.alerts.length > 0;
  const hasInteractions = safetyAnalysis.interactions.length > 0;

  if (!hasAlerts && !hasInteractions) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {hasCriticalAlerts && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>ALERTA DE SEGURANÇA CRÍTICO</AlertTitle>
          <AlertDescription>
            Detectamos riscos graves nesta fórmula.
          </AlertDescription>
        </Alert>
      )}

      {safetyAnalysis.alerts.map((alert, index) => (
        <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : alert.type === 'warning' ? 'warning' : alert.type === 'caution' ? 'default' : 'info'}>
          {alert.type === 'critical' ? (
            <ShieldAlert className="h-4 w-4" />
          ) : alert.type === 'warning' ? (
            <ShieldAlert className="h-4 w-4" />
          ) : alert.type === 'caution' ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            {alert.message}
            <br />
            <span className="font-semibold">Recomendação:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {hasInteractions && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            Possíveis Interações Medicamentosas:
          </h4>
          {safetyAnalysis.interactions.map((interaction, index) => (
            <Alert key={index} variant="warning">
              <AlertTitle>Interação: {interaction.drug1} + {interaction.drug2}</AlertTitle>
              <AlertDescription>{interaction.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacySafetyAlert;
