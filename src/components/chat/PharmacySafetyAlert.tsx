
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DRUG_DATABASE, DRUG_INTERACTIONS, DrugInfo } from '@/data/pharmacologyData';
import { ShieldAlert, ShieldCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ParsedActive {
  name: string;
  dose: number;
  unit: string;
  percentage?: number; // Para formulações tópicas
}

interface SafetyAlert {
  type: 'critical' | 'warning' | 'caution' | 'info' | 'safe' | 'impossible';
  title: string;
  message: string;
  active: string;
  recommendation: string;
  severity?: 'bloqueante' | 'alto' | 'moderado' | 'baixo';
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
  totalPercentage?: number;
  formulationType?: 'oral' | 'topical' | 'mixed';
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

  // Detectar tipo de formulação (tópica ou oral)
  const detectFormulationType = (text: string): 'oral' | 'topical' | 'mixed' => {
    const topicalKeywords = ['pomada', 'creme', 'gel', 'loção', '%', 'qsp', 'base'];
    const oralKeywords = ['cápsula', 'mg', 'sachê', 'pó'];
    
    const hasTopical = topicalKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    const hasOral = oralKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (hasTopical && hasOral) return 'mixed';
    if (hasTopical) return 'topical';
    return 'oral';
  };

  const parseActivesFromText = (text: string): ParsedActive[] => {
    const actives: ParsedActive[] = [];
    const formulationType = detectFormulationType(text);
    
    // Regex para diferentes formatos
    const regexes = [
      // Formato percentual (tópicos): "Arnica 5%"
      /•\s*([A-Za-zÀ-ú\s]+?)\s*(\d+(?:\.\d+)?)\s*%/g,
      // Formato com unidades (orais): "Vitamina D 1000mg"
      /•\s*([A-Za-zÀ-ú\s]+?)\s*(\d+(?:\.\d+)?)\s*(mg|mcg|UI|g)\b/g,
      // Formato simples: apenas nome e número
      /•\s*([A-Za-zÀ-ú\s]+?)\s*(\d+(?:\.\d+)?)/g
    ];

    regexes.forEach(regex => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const name = match[1].trim();
        const dose = parseFloat(match[2]);
        const unit = match[3] || (formulationType === 'topical' ? '%' : 'mg');
        
        // Evitar duplicatas
        if (!actives.find(a => a.name.toLowerCase() === name.toLowerCase())) {
          const active: ParsedActive = { name, dose, unit };
          if (unit === '%') {
            active.percentage = dose;
          }
          actives.push(active);
        }
      }
    });

    return actives;
  };

  useEffect(() => {
    const actives = parseActivesFromText(messageContent);
    const analysis = analyzeSafety(actives, messageContent);
    setSafetyAnalysis(analysis);
  }, [messageContent]);

  const analyzeSafety = (actives: ParsedActive[], fullText: string): SafetyAnalysis => {
    const alerts: SafetyAlert[] = [];
    const interactions: DrugInteraction[] = [];
    const safeActives: string[] = [];
    const formulationType = detectFormulationType(fullText);
    
    // Calcular porcentagem total para fórmulas tópicas
    const totalPercentage = actives
      .filter(a => a.unit === '%')
      .reduce((sum, a) => sum + a.dose, 0);

    // ALERTA CRÍTICO: Porcentagem impossível (>100%)
    if (totalPercentage > 100) {
      alerts.push({
        type: 'impossible',
        title: '🚨 ERRO FARMACOTÉCNICO CRÍTICO',
        message: `Total de ativos: ${totalPercentage}% - FISICAMENTE IMPOSSÍVEL!`,
        active: 'FÓRMULA COMPLETA',
        recommendation: 'REFORMULAR IMEDIATAMENTE. Nenhuma fórmula pode ter mais de 100% de ativos.',
        severity: 'bloqueante'
      });
    }

    // ALERTA: Porcentagem muito alta (>80% mas ≤100%)
    if (totalPercentage > 80 && totalPercentage <= 100) {
      alerts.push({
        type: 'critical',
        title: '⚠️ Concentração total muito alta',
        message: `Total de ativos: ${totalPercentage}% - Pouco espaço para excipientes`,
        active: 'FÓRMULA COMPLETA',
        recommendation: 'Reduzir concentrações para permitir base adequada (máximo 70-80%)',
        severity: 'alto'
      });
    }

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
        drugKey.replace('quelato', '').trim(),
        drugKey.replace('ext ', '').replace('extrato ', '').trim(),
        drugKey.replace('glicol', '').replace('glicólico', '').trim()
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
        // Para fórmulas tópicas, verificar limites específicos
        if (formulationType === 'topical' && active.unit === '%') {
          // Limites específicos para ativos tópicos comuns
          const topicalLimits: Record<string, number> = {
            'arnica': 5,
            'calendula': 10,
            'camomila': 10,
            'mentol': 2,
            'canfora': 3,
            'salicilato': 5,
            'capsaicina': 0.1,
            'lidocaina': 2,
            'benzocaina': 5
          };

          const limit = topicalLimits[drugKey] || 10; // Default 10% para extratos
          
          if (active.dose > limit * 3) { // Mais de 3x o limite
            alerts.push({
              type: 'impossible',
              title: '🚨 CONCENTRAÇÃO PERIGOSA',
              message: `${active.name} ${active.dose}% - Limite máximo seguro: ${limit}%`,
              active: active.name,
              recommendation: `REDUZIR IMEDIATAMENTE para máximo ${limit}%. Risco de irritação/toxicidade.`,
              severity: 'bloqueante'
            });
          } else if (active.dose > limit) {
            alerts.push({
              type: 'critical',
              title: '⚠️ Acima do limite recomendado',
              message: `${active.name} ${active.dose}% - Recomendado: máximo ${limit}%`,
              active: active.name,
              recommendation: `Considerar redução para ${limit}% ou menor para segurança`,
              severity: 'alto'
            });
          } else {
            safeActives.push(active.name);
            alerts.push({
              type: 'safe',
              title: '✅ Concentração adequada',
              message: `${active.name} ${active.dose}% - Dentro do limite seguro`,
              active: active.name,
              recommendation: 'Concentração apropriada para uso tópico'
            });
          }
        } 
        // Para fórmulas orais
        else {
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

          if (percentage > 200) { // Dose extremamente perigosa
            alerts.push({
              type: 'impossible',
              title: '🚨 DOSE EXTREMAMENTE PERIGOSA',
              message: `${active.name} ${active.dose}${active.unit} - ${Math.round(percentage)}% acima do limite (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
              active: active.name,
              recommendation: `CONTRAINDICADO! Reduzir para máximo ${drugInfo.maxDailyDose}${drugInfo.unit}. ${drugInfo.recommendedDose ? 'Dose terapêutica: ' + drugInfo.recommendedDose : ''}`,
              severity: 'bloqueante'
            });
          } else if (percentage > 150) {
            alerts.push({
              type: 'critical',
              title: '🚨 DOSE PERIGOSA',
              message: `${active.name} ${active.dose}${active.unit} - ${Math.round(percentage)}% acima do limite seguro`,
              active: active.name,
              recommendation: `REDUZIR IMEDIATAMENTE para máximo ${drugInfo.maxDailyDose}${drugInfo.unit}/dia`,
              severity: 'alto'
            });
          } else if (percentage > 100) {
            alerts.push({
              type: 'warning',
              title: '⚠️ Dose acima do limite',
              message: `${active.name} ${active.dose}${active.unit} excede a dose máxima (${drugInfo.maxDailyDose}${drugInfo.unit}/dia)`,
              active: active.name,
              recommendation: `Reduzir para máximo ${drugInfo.maxDailyDose}${drugInfo.unit}/dia`,
              severity: 'moderado'
            });
          } else if (percentage > 80) {
            alerts.push({
              type: 'caution',
              title: '⚡ Dose próxima do limite',
              message: `${active.name} ${active.dose}${active.unit} - ${Math.round(percentage)}% do limite máximo`,
              active: active.name,
              recommendation: 'Dose apropriada. Monitorar tolerabilidade do paciente.',
              severity: 'baixo'
            });
          } else {
            safeActives.push(active.name);
            alerts.push({
              type: 'safe',
              title: '✅ Dose segura',
              message: `${active.name} ${active.dose}${active.unit} - Faixa terapêutica adequada`,
              active: active.name,
              recommendation: 'Dose apropriada conforme literatura científica'
            });
          }
        }

        // Alertas de precauções específicas
        if (drugInfo.warnings && drugInfo.warnings.length > 0) {
          alerts.push({
            type: 'warning',
            title: '❗ Precauções específicas',
            message: `${active.name}: ${drugInfo.warnings.join(', ')}`,
            active: active.name,
            recommendation: drugInfo.contraindications ? 
              `Contraindicações: ${drugInfo.contraindications.join(', ')}` : 
              'Monitorar conforme precauções descritas'
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
        // Ativo não encontrado na base
        alerts.push({
          type: 'info',
          title: '📋 Verificação necessária',
          message: `${active.name} ${active.dose}${active.unit} - Não encontrado na base PubMed/Micromedex`,
          active: active.name,
          recommendation: 'Consultar Micromedex, PubMed ou Martindale para validação da dosagem'
        });
      }
    });

    return { 
      alerts, 
      interactions, 
      safeActives, 
      totalPercentage: formulationType === 'topical' ? totalPercentage : undefined,
      formulationType 
    };
  };

  const impossibleAlerts = safetyAnalysis.alerts.filter(alert => alert.type === 'impossible');
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
          Validação Farmacotécnica Automática (Base: PubMed/Micromedex)
        </h4>
        
        {safetyAnalysis.formulationType === 'topical' && safetyAnalysis.totalPercentage && (
          <div className="mb-2 text-xs text-slate-300">
            <span className="font-medium">Total de ativos: {safetyAnalysis.totalPercentage}%</span>
            {safetyAnalysis.totalPercentage > 100 && (
              <span className="ml-2 text-red-400 font-semibold">⚠️ FISICAMENTE IMPOSSÍVEL</span>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs">
          {impossibleAlerts.length > 0 && (
            <Badge className="bg-red-800/50 text-red-200 border-red-600">
              🚨 {impossibleAlerts.length} erro(s) crítico(s)
            </Badge>
          )}
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-600/30 text-red-300">
              ⚠️ {criticalAlerts.length} alerta(s) crítico(s)
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge className="bg-orange-600/30 text-orange-300">
              ❗ {warningAlerts.length} precaução(ões)
            </Badge>
          )}
          {safeAlerts.length > 0 && (
            <Badge className="bg-green-600/30 text-green-300">
              ✅ {safeAlerts.length} dose(s) adequada(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Alertas Impossíveis/Bloqueantes */}
      {impossibleAlerts.map((alert, index) => (
        <Alert key={index} className="border-red-800 bg-red-950/50 text-red-200">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-300">{alert.title}</AlertTitle>
          <AlertDescription className="text-red-200">
            {alert.message}
            <br />
            <span className="font-semibold text-red-300">🚫 BLOQUEANTE:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Alertas Críticos */}
      {criticalAlerts.map((alert, index) => (
        <Alert key={index} variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>
            {alert.message}
            <br />
            <span className="font-semibold">Ação necessária:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Alertas de Warning */}
      {warningAlerts.map((alert, index) => (
        <Alert key={index} variant="warning">
          <AlertTriangle className="h-4 w-4" />
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
          <AlertTitle className="text-green-300">Dosagens Farmacotecnicamente Validadas</AlertTitle>
          <AlertDescription className="text-green-200">
            {safeAlerts.map(alert => alert.active).join(', ')} - concentrações dentro da faixa terapêutica estabelecida.
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
            <span className="font-semibold">Ação:</span> {alert.recommendation}
          </AlertDescription>
        </Alert>
      ))}

      {/* Interações Medicamentosas */}
      {hasInteractions && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" />
            Interações Medicamentosas Detectadas:
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
