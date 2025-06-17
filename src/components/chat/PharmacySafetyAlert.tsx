
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DRUG_DATABASE, DRUG_INTERACTIONS, DrugInfo } from '@/data/pharmacologyData';
import { ShieldAlert, ShieldCheck, Info, CheckCircle } from 'lucide-react';

interface ParsedActive {
  name: string;
  dose: number;
  unit: string;
}

interface SafetyAlert {
  type: 'critical' | 'warning' | 'caution' | 'info' | 'safe';
  title: string;
  message: string;
  active: string;
  recommendation: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface SafetyAnalysis {
  alerts: SafetyAlert[];
  interactions: DrugInteraction[];
  safeActives: string[];
}

interface PharmacySafetyAlertProps {
  messageContent: string;
}

const PharmacySafetyAlert = ({ messageContent }: PharmacySafetyAlertProps) => {
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysis>({ 
    alerts: [], 
    interactions: [],
    safeActives: []
  });

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
    const safeActives: string[] = [];

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
        drugKey.replace('acido', 'ácido').replace('ácido', 'acido'),
        drugKey.replace('quelato', '').trim()
      ];

      let drugInfo = null;
      let matchedKey = '';
      for (const key of possibleKeys) {
        if (DRUG_DATABASE[key]) {
          drugInfo = DRUG_DATABASE[key];
          matchedKey = key;
          break;
        }
      }

      if (drugInfo) {
        // Converter unidades se necessário
        let normalizedDose = active.dose;
        if (active.unit !== drugInfo.unit) {
          if (active.unit === 'mcg' && drugInfo.unit === 'mg') {
            normalizedDose = active.dose / 1000;
          } else if (active.unit === 'mg' && drugInfo.unit === 'mcg') {
            normalizedDose = active.dose * 1000;
          }
        }

        const percentage = (normalizedDose / drugInfo.maxDailyDose) * 100;

        // Análise de dosagem mais precisa
        if (percentage > 150) {
          alerts.push({
            type: 'critical',
            title: '🚨 DOSE PERIGOSA',
            message: `${active.name} ${active.dose}${active.unit} está ${Math.round(percentage)}% acima da dose máxima segura (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
            active: active.name,
            recommendation: `REDUZIR IMEDIATAMENTE para no máximo ${drugInfo.maxDailyDose}${drugInfo.unit}/dia. ${drugInfo.recommendedDose ? 'Dose recomendada: ' + drugInfo.recommendedDose : ''}`
          });
        } else if (percentage > 100) {
          alerts.push({
            type: 'warning',
            title: '⚠️ Dose acima do limite',
            message: `${active.name} ${active.dose}${active.unit} excede a dose máxima (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
            active: active.name,
            recommendation: `Reduzir para no máximo ${drugInfo.maxDailyDose}${drugInfo.unit}/dia. ${drugInfo.recommendedDose ? 'Dose ideal: ' + drugInfo.recommendedDose : ''}`
          });
        } else if (percentage > 80) {
          alerts.push({
            type: 'caution',
            title: '⚡ Dose próxima do limite',
            message: `${active.name} ${active.dose}${active.unit} está próximo da dose máxima (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
            active: active.name,
            recommendation: `Dose apropriada. Monitorar tolerabilidade do paciente.`
          });
        } else {
          // Dose segura
          safeActives.push(active.name);
          alerts.push({
            type: 'safe',
            title: '✅ Dose segura',
            message: `${active.name} ${active.dose}${active.unit} está dentro da faixa terapêutica segura`,
            active: active.name,
            recommendation: `Dose apropriada conforme literatura científica.`
          });
        }

        // Alertas específicos de precauções
        if (drugInfo.warnings && drugInfo.warnings.length > 0) {
          alerts.push({
            type: 'warning',
            title: '❗ Precauções importantes',
            message: `${active.name}: ${drugInfo.warnings.join(', ')}`,
            active: active.name,
            recommendation: drugInfo.contraindications ? 
              `Contraindicações: ${drugInfo.contraindications.join(', ')}` : 
              'Monitorar paciente conforme descrito'
          });
        }

        // Verificar interações medicamentosas
        if (drugInfo.interactions && drugInfo.interactions.length > 0) {
          drugInfo.interactions.forEach(interactionDrug => {
            const interactedActive = actives.find(otherActive => {
              const otherDrugKey = otherActive.name.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              return otherDrugKey.includes(interactionDrug) || interactionDrug.includes(otherDrugKey);
            });

            if (interactedActive) {
              interactions.push({
                drug1: active.name,
                drug2: interactedActive.name,
                description: DRUG_INTERACTIONS[matchedKey]?.[interactionDrug] || 
                  `Possível interação entre ${active.name} e ${interactedActive.name}`,
                severity: 'medium'
              });
            }
          });
        }
      } else {
        // Ativo não encontrado - mais específico
        alerts.push({
          type: 'info',
          title: '📋 Verificação necessária',
          message: `${active.name} não foi encontrado na base farmacotécnica (PubMed/Micromedex)`,
          active: active.name,
          recommendation: 'Consultar Micromedex, PubMed ou Martindale para validação da dosagem e segurança'
        });
      }
    });

    return { alerts, interactions, safeActives };
  };

  const criticalAlerts = safetyAnalysis.alerts.filter(alert => alert.type === 'critical');
  const warningAlerts = safetyAnalysis.alerts.filter(alert => alert.type === 'warning');
  const cautionAlerts = safetyAnalysis.alerts.filter(alert => alert.type === 'caution');
  const safeAlerts = safetyAnalysis.alerts.filter(alert => alert.type === 'safe');
  const infoAlerts = safetyAnalysis.alerts.filter(alert => alert.type === 'info');
  
  const hasAlerts = safetyAnalysis.alerts.length > 0;
  const hasInteractions = safetyAnalysis.interactions.length > 0;

  if (!hasAlerts && !hasInteractions) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Resumo de Segurança */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Análise Farmacotécnica (Base: PubMed/Micromedex)
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {safeAlerts.length > 0 && (
            <Badge className="bg-green-600/30 text-green-300">
              ✅ {safeAlerts.length} dose(s) segura(s)
            </Badge>
          )}
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-600/30 text-red-300">
              🚨 {criticalAlerts.length} dose(s) perigosa(s)
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge className="bg-orange-600/30 text-orange-300">
              ⚠️ {warningAlerts.length} alerta(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts.map((alert, index) => (
        <Alert key={index} variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            {alert.message}
            <br />
            <span className="font-semibold">Ação imediata:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Alertas de Warning */}
      {warningAlerts.map((alert, index) => (
        <Alert key={index} variant="warning">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            {alert.message}
            <br />
            <span className="font-semibold">Recomendação:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Alertas de Precaução */}
      {cautionAlerts.map((alert, index) => (
        <Alert key={index} variant="default">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            {alert.message}
            <br />
            <span className="font-semibold">Orientação:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Doses Seguras */}
      {safeAlerts.length > 0 && (
        <Alert variant="default" className="border-green-600/50 bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle className="text-green-300">Doses Farmacotecnicamente Apropriadas</AlertTitle>
          <AlertDescription className="text-green-200">
            {safeAlerts.map(alert => alert.active).join(', ')} - dosagens dentro da faixa terapêutica estabelecida por estudos clínicos.
          </AlertDescription>
        </Alert>
      )}

      {/* Alertas de Info */}
      {infoAlerts.map((alert, index) => (
        <Alert key={index} variant="info">
          <Info className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            {alert.message}
            <br />
            <span className="font-semibold">Verificação:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Interações Medicamentosas */}
      {hasInteractions && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            Interações Medicamentosas Identificadas:
          </h4>
          {safetyAnalysis.interactions.map((interaction, index) => (
            <Alert key={index} variant="warning">
              <AlertTitle>⚠️ {interaction.drug1} + {interaction.drug2}</AlertTitle>
              <AlertDescription>
                {interaction.description}
                <br />
                <span className="font-semibold">Severidade:</span> {
                  interaction.severity === 'high' ? 'Alta' : 
                  interaction.severity === 'medium' ? 'Moderada' : 'Baixa'
                }
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacySafetyAlert;
