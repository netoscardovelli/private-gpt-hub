
import { logger } from '@/utils/logger';

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  // Coletar métricas de contador
  counter(name: string, value: number = 1, tags?: Record<string, string>) {
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      tags,
      type: 'counter'
    });
  }

  // Coletar métricas de gauge (valores instantâneos)
  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      tags,
      type: 'gauge'
    });
  }

  // Cronometrar operações
  async timer<T>(name: string, operation: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const startTime = performance.now();
    let success = true;
    let error: string | undefined;

    try {
      const result = await operation();
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const duration = performance.now() - startTime;
      
      this.addMetric({
        name: `${name}_duration`,
        value: duration,
        timestamp: Date.now(),
        tags,
        type: 'timer'
      });

      this.performanceMetrics.push({
        operation: name,
        duration,
        success,
        error,
        timestamp: Date.now()
      });

      logger.debug('Operation completed', {
        operation: name,
        duration: `${duration.toFixed(2)}ms`,
        success,
        error
      });
    }
  }

  // Adicionar métrica ao buffer
  private addMetric(metric: Metric) {
    this.metrics.push(metric);
    
    // Limitar o tamanho do buffer
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Obter métricas agregadas
  getAggregatedMetrics(timeWindow: number = 300000) { // 5 minutos
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeWindow);
    
    const aggregated: Record<string, { count: number; sum: number; avg: number; min: number; max: number }> = {};
    
    recentMetrics.forEach(metric => {
      if (!aggregated[metric.name]) {
        aggregated[metric.name] = {
          count: 0,
          sum: 0,
          avg: 0,
          min: metric.value,
          max: metric.value
        };
      }
      
      const agg = aggregated[metric.name];
      agg.count++;
      agg.sum += metric.value;
      agg.min = Math.min(agg.min, metric.value);
      agg.max = Math.max(agg.max, metric.value);
      agg.avg = agg.sum / agg.count;
    });
    
    return aggregated;
  }

  // Obter métricas de performance
  getPerformanceStats(timeWindow: number = 300000) {
    const now = Date.now();
    const recentPerf = this.performanceMetrics.filter(p => now - p.timestamp <= timeWindow);
    
    const stats: Record<string, {
      totalCalls: number;
      successRate: number;
      avgDuration: number;
      p95Duration: number;
      errors: string[];
    }> = {};
    
    recentPerf.forEach(perf => {
      if (!stats[perf.operation]) {
        stats[perf.operation] = {
          totalCalls: 0,
          successRate: 0,
          avgDuration: 0,
          p95Duration: 0,
          errors: []
        };
      }
      
      const stat = stats[perf.operation];
      stat.totalCalls++;
      
      if (perf.error) {
        stat.errors.push(perf.error);
      }
    });
    
    // Calcular estatísticas finais
    Object.keys(stats).forEach(operation => {
      const operationPerfs = recentPerf.filter(p => p.operation === operation);
      const successCount = operationPerfs.filter(p => p.success).length;
      
      stats[operation].successRate = (successCount / operationPerfs.length) * 100;
      stats[operation].avgDuration = operationPerfs.reduce((sum, p) => sum + p.duration, 0) / operationPerfs.length;
      
      // Calcular P95
      const sortedDurations = operationPerfs.map(p => p.duration).sort((a, b) => a - b);
      const p95Index = Math.floor(sortedDurations.length * 0.95);
      stats[operation].p95Duration = sortedDurations[p95Index] || 0;
    });
    
    return stats;
  }

  // Limpar métricas antigas
  cleanup(maxAge: number = 3600000) { // 1 hora
    const now = Date.now();
    this.metrics = this.metrics.filter(m => now - m.timestamp <= maxAge);
    this.performanceMetrics = this.performanceMetrics.filter(p => now - p.timestamp <= maxAge);
  }
}

export const metricsCollector = new MetricsCollector();

// Configurar limpeza automática
setInterval(() => {
  metricsCollector.cleanup();
}, 300000); // Limpar a cada 5 minutos
