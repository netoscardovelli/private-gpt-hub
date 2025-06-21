
import { logger } from '@/utils/logger';
import { metricsCollector, type PerformanceMetric } from './MetricsCollector';
import { alertingService } from './AlertingService';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  alerts: {
    active: number;
    critical: number;
  };
  services: {
    database: 'up' | 'down' | 'degraded';
    ai: 'up' | 'down' | 'degraded';
    storage: 'up' | 'down' | 'degraded';
  };
}

class MonitoringService {
  private startTime: number;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startTime = Date.now();
    this.startHealthChecks();
  }

  // Monitorar operação específica
  async monitorOperation<T>(
    operationName: string, 
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    logger.debug('Operation started', { operation: operationName, context });
    
    return metricsCollector.timer(operationName, async () => {
      const result = await operation();
      
      // Coletar métricas específicas baseadas no tipo de operação
      if (operationName.includes('chat')) {
        metricsCollector.counter('chat_requests_total');
      } else if (operationName.includes('database')) {
        metricsCollector.counter('database_operations_total');
      } else if (operationName.includes('ai')) {
        metricsCollector.counter('ai_requests_total');
      }
      
      return result;
    }, context);
  }

  // Obter saúde do sistema
  async getSystemHealth(): Promise<SystemHealth> {
    const performanceStats = metricsCollector.getPerformanceStats();
    const alertStats = alertingService.getAlertStats();
    
    const memory = this.getMemoryUsage();
    const performance = this.calculatePerformanceMetrics(performanceStats);
    const services = await this.checkServices();
    
    const status = this.determineOverallStatus(memory, performance, alertStats, services);
    
    return {
      status,
      uptime: Date.now() - this.startTime,
      memory,
      performance,
      alerts: {
        active: alertStats.active,
        critical: alertStats.byLevel.critical
      },
      services
    };
  }

  // Obter uso de memória
  private getMemoryUsage() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    
    return {
      used: 0,
      total: 0,
      percentage: 0
    };
  }

  // Calcular métricas de performance
  private calculatePerformanceMetrics(performanceStats: any) {
    const allOps = Object.values(performanceStats) as any[];
    
    if (allOps.length === 0) {
      return {
        avgResponseTime: 0,
        errorRate: 0,
        throughput: 0
      };
    }
    
    const totalCalls = allOps.reduce((sum, op) => sum + op.totalCalls, 0);
    const avgResponseTime = allOps.reduce((sum, op) => sum + (op.avgDuration * op.totalCalls), 0) / totalCalls || 0;
    const totalErrors = allOps.reduce((sum, op) => sum + op.errors.length, 0);
    const errorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;
    
    // Throughput por minuto
    const throughput = totalCalls / 5; // 5 minutos de janela
    
    return {
      avgResponseTime,
      errorRate,
      throughput
    };
  }

  // Verificar status dos serviços
  private async checkServices(): Promise<SystemHealth['services']> {
    const services: SystemHealth['services'] = {
      database: 'up',
      ai: 'up',
      storage: 'up'
    };

    try {
      // Verificação simples do banco (pode ser expandida)
      const dbStats = metricsCollector.getPerformanceStats();
      const dbOps = Object.keys(dbStats).filter(key => key.includes('database'));
      
      if (dbOps.length > 0) {
        const hasDbErrors = dbOps.some(op => dbStats[op].successRate < 90);
        services.database = hasDbErrors ? 'degraded' : 'up';
      }

      // Verificação da API de IA
      const aiOps = Object.keys(dbStats).filter(key => key.includes('ai') || key.includes('openai'));
      if (aiOps.length > 0) {
        const hasAiErrors = aiOps.some(op => dbStats[op].successRate < 95);
        services.ai = hasAiErrors ? 'degraded' : 'up';
      }

    } catch (error) {
      logger.error('Error checking services', { error });
    }

    return services;
  }

  // Determinar status geral do sistema
  private determineOverallStatus(
    memory: SystemHealth['memory'],
    performance: SystemHealth['performance'],
    alerts: any,
    services: SystemHealth['services']
  ): SystemHealth['status'] {
    // Crítico se houver alertas críticos
    if (alerts.byLevel.critical > 0) {
      return 'critical';
    }

    // Crítico se algum serviço estiver down
    if (Object.values(services).includes('down')) {
      return 'critical';
    }

    // Degradado se memória > 85% ou error rate > 10%
    if (memory.percentage > 85 || performance.errorRate > 10) {
      return 'degraded';
    }

    // Degradado se algum serviço estiver degradado
    if (Object.values(services).includes('degraded')) {
      return 'degraded';
    }

    // Degradado se tempo de resposta muito alto
    if (performance.avgResponseTime > 3000) {
      return 'degraded';
    }

    return 'healthy';
  }

  // Iniciar verificações de saúde automáticas
  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        // Log do status do sistema
        logger.info('System health check', {
          status: health.status,
          uptime: health.uptime,
          memoryUsage: `${health.memory.percentage.toFixed(1)}%`,
          errorRate: `${health.performance.errorRate.toFixed(2)}%`,
          avgResponseTime: `${health.performance.avgResponseTime.toFixed(0)}ms`,
          activeAlerts: health.alerts.active
        });

        // Coletar métricas do sistema
        metricsCollector.gauge('system_memory_usage_percent', health.memory.percentage);
        metricsCollector.gauge('system_error_rate_percent', health.performance.errorRate);
        metricsCollector.gauge('system_avg_response_time_ms', health.performance.avgResponseTime);
        metricsCollector.gauge('system_active_alerts', health.alerts.active);

      } catch (error) {
        logger.error('Health check failed', { error });
      }
    }, 60000); // A cada minuto
  }

  // Parar monitoramento
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Reportar erro personalizado
  reportError(error: Error, context?: Record<string, any>) {
    logger.error('Application error reported', {
      error: error.message,
      stack: error.stack,
      context
    });

    metricsCollector.counter('application_errors_total', 1, {
      error_type: error.name,
      ...context
    });

    // Criar alerta para erros críticos
    if (context?.critical) {
      alertingService.createAlert(
        'error',
        'Application Error',
        `${error.message}${context?.operation ? ` in ${context.operation}` : ''}`,
        'application'
      );
    }
  }

  // Obter métricas resumidas
  getMetricsSummary() {
    return {
      aggregated: metricsCollector.getAggregatedMetrics(),
      performance: metricsCollector.getPerformanceStats(),
      alerts: alertingService.getAlertStats()
    };
  }
}

export const monitoringService = new MonitoringService();

// Configurar handler global de erros
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoringService.reportError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    monitoringService.reportError(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      { type: 'unhandled_rejection' }
    );
  });
}
