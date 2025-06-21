
import { logger } from '@/utils/logger';
import { metricsCollector } from './MetricsCollector';

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  source: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: any) => boolean;
  level: Alert['level'];
  message: string;
  cooldown: number; // ms
}

class AlertingService {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private lastTriggered: Record<string, number> = {};
  private readonly maxAlerts = 100;

  constructor() {
    this.setupDefaultRules();
    this.startMonitoring();
  }

  // Configurar regras padrão de alerta
  private setupDefaultRules() {
    this.rules = [
      {
        id: 'high_error_rate',
        name: 'Alta Taxa de Erro',
        condition: (stats) => {
          const chatStats = stats['chat-request'];
          return chatStats && chatStats.successRate < 95;
        },
        level: 'error',
        message: 'Taxa de erro do chat acima de 5%',
        cooldown: 300000 // 5 minutos
      },
      {
        id: 'slow_response_time',
        name: 'Tempo de Resposta Lento',
        condition: (stats) => {
          const chatStats = stats['chat-request'];
          return chatStats && chatStats.p95Duration > 5000; // 5 segundos
        },
        level: 'warning',
        message: 'Tempo de resposta do chat está lento (P95 > 5s)',
        cooldown: 600000 // 10 minutos
      },
      {
        id: 'memory_usage_high',
        name: 'Uso de Memória Alto',
        condition: () => {
          if (typeof performance !== 'undefined' && (performance as any).memory) {
            const memory = (performance as any).memory;
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            return usagePercent > 80;
          }
          return false;
        },
        level: 'warning',
        message: 'Uso de memória acima de 80%',
        cooldown: 300000
      },
      {
        id: 'api_quota_warning',
        name: 'Cota de API Próxima do Limite',
        condition: (stats) => {
          const openaiCalls = stats['openai-api-call'];
          return openaiCalls && openaiCalls.totalCalls > 800; // Por hora
        },
        level: 'warning',
        message: 'Aproximando do limite de cota da API OpenAI',
        cooldown: 3600000 // 1 hora
      }
    ];
  }

  // Adicionar regra personalizada
  addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  // Criar alerta
  createAlert(level: Alert['level'], title: string, message: string, source: string = 'system'): string {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      title,
      message,
      timestamp: Date.now(),
      resolved: false,
      source
    };

    this.alerts.unshift(alert);
    
    // Limitar número de alertas
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    logger.warn('Alert created', {
      alertId: alert.id,
      level: alert.level,
      title: alert.title,
      message: alert.message
    });

    // Notificar sobre alertas críticos
    if (level === 'critical') {
      this.notifyCriticalAlert(alert);
    }

    return alert.id;
  }

  // Resolver alerta
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger.info('Alert resolved', { alertId });
    }
  }

  // Obter alertas ativos
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  // Obter todos os alertas
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Iniciar monitoramento automático
  private startMonitoring() {
    setInterval(() => {
      this.checkRules();
    }, 60000); // Verificar a cada minuto
  }

  // Verificar regras de alerta
  private checkRules() {
    const performanceStats = metricsCollector.getPerformanceStats();
    const now = Date.now();

    this.rules.forEach(rule => {
      const lastTriggered = this.lastTriggered[rule.id] || 0;
      
      // Verificar cooldown
      if (now - lastTriggered < rule.cooldown) {
        return;
      }

      try {
        if (rule.condition(performanceStats)) {
          this.createAlert(rule.level, rule.name, rule.message, 'monitoring');
          this.lastTriggered[rule.id] = now;
        }
      } catch (error) {
        logger.error('Error checking alert rule', {
          ruleId: rule.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  // Notificar sobre alertas críticos
  private notifyCriticalAlert(alert: Alert) {
    // Em produção, aqui você enviaria para Slack, email, etc.
    console.error('🚨 CRITICAL ALERT:', {
      title: alert.title,
      message: alert.message,
      timestamp: new Date(alert.timestamp).toISOString()
    });
  }

  // Obter estatísticas de alertas
  getAlertStats(timeWindow: number = 86400000) { // 24 horas
    const now = Date.now();
    const recentAlerts = this.alerts.filter(a => now - a.timestamp <= timeWindow);
    
    const stats = {
      total: recentAlerts.length,
      byLevel: {
        info: recentAlerts.filter(a => a.level === 'info').length,
        warning: recentAlerts.filter(a => a.level === 'warning').length,
        error: recentAlerts.filter(a => a.level === 'error').length,
        critical: recentAlerts.filter(a => a.level === 'critical').length
      },
      resolved: recentAlerts.filter(a => a.resolved).length,
      active: recentAlerts.filter(a => !a.resolved).length
    };

    return stats;
  }
}

export const alertingService = new AlertingService();
