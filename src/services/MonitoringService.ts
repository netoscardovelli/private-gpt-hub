
import { supabase } from '@/integrations/supabase/client';

interface LogEvent {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  event: string;
  userId?: string;
  sessionId: string;
  metadata: Record<string, any>;
  context: {
    userAgent: string;
    url: string;
    component?: string;
  };
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags: Record<string, string>;
}

class MonitoringService {
  private sessionId: string;
  private userId?: string;
  private static instance: MonitoringService;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.initializeSession();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeSession() {
    try {
      await supabase.from('user_sessions').insert({
        session_id: this.sessionId,
        user_id: this.userId,
        user_agent: navigator.userAgent,
        ip_address: null, // Will be handled by server
        metadata: {
          screen: {
            width: window.screen.width,
            height: window.screen.height
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  async log(level: LogEvent['level'], event: string, metadata: any = {}, component?: string) {
    const logEntry: LogEvent = {
      timestamp: new Date().toISOString(),
      level,
      event,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        component
      }
    };

    // Log local para desenvolvimento
    if (import.meta.env.DEV) {
      console[level](`[${level.toUpperCase()}] ${event}:`, metadata);
    }

    try {
      await supabase.from('application_logs').insert({
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        event: logEntry.event,
        user_id: logEntry.userId,
        session_id: logEntry.sessionId,
        metadata: logEntry.metadata,
        context: logEntry.context
      });
    } catch (error) {
      console.error('Failed to save log:', error);
    }

    // Update session activity
    this.updateSessionActivity();
  }

  async trackPerformance(name: string, value: number, unit: string, tags: Record<string, string> = {}) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags: {
        ...tags,
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous'
      }
    };

    try {
      await supabase.from('performance_metrics').insert(metric);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    await this.log('info', eventName, properties, 'analytics');

    switch (eventName) {
      case 'query_submitted':
        await this.trackQueryMetrics(properties);
        break;
      case 'pdf_generated':
        await this.trackPDFGeneration(properties);
        break;
      case 'user_upgrade':
        await this.trackConversion(properties);
        break;
      case 'cache_hit':
        await this.trackCacheMetrics(properties);
        break;
    }
  }

  private async trackQueryMetrics(properties: any) {
    const { startTime, endTime, specialty, provider, fromCache, tokens } = properties;
    
    if (startTime && endTime) {
      const responseTime = endTime - startTime;
      await this.trackPerformance('ai_response_time', responseTime, 'ms', {
        specialty: specialty || 'general',
        provider: provider || 'unknown',
        cached: fromCache ? 'true' : 'false'
      });
    }

    if (properties.response) {
      await this.trackPerformance('response_length', properties.response.length, 'chars', {
        specialty: specialty || 'general'
      });
    }

    if (tokens) {
      await this.trackPerformance('tokens_used', tokens, 'tokens', {
        provider: provider || 'unknown'
      });
    }
  }

  private async trackPDFGeneration(properties: any) {
    const { duration, sections, pages } = properties;
    
    if (duration) {
      await this.trackPerformance('pdf_generation_time', duration, 'ms', {
        sections: sections?.length?.toString() || '0',
        pages: pages?.toString() || '1'
      });
    }
  }

  private async trackConversion(properties: any) {
    await this.log('info', 'conversion_completed', {
      fromTier: properties.fromTier,
      toTier: properties.toTier,
      value: properties.value,
      currency: 'BRL'
    }, 'business');
  }

  private async trackCacheMetrics(properties: any) {
    await this.trackPerformance('cache_hit_rate', properties.hitRate || 0, 'percentage', {
      specialty: properties.specialty || 'general'
    });
  }

  async trackError(error: Error, context: any = {}) {
    await this.log('error', 'application_error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  private setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      });
    });
  }

  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformance('lcp', entry.startTime, 'ms', {
              element: (entry as any).element?.tagName || 'unknown'
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // First Input Delay
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformance('fid', (entry as any).processingStart - entry.startTime, 'ms', {
              eventType: entry.name
            });
          }
        }).observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID monitoring not supported');
      }
    }

    // Page load metrics
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms');
        this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
      }
    });
  }

  private async updateSessionActivity() {
    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', this.sessionId);
    } catch (error) {
      // Silent fail
    }
  }

  async getCacheMetrics(): Promise<{
    hitRate: number;
    totalEntries: number;
    avgQualityScore: number;
    topQueries: any[];
  }> {
    try {
      const { data: stats } = await supabase
        .from('query_cache')
        .select('hit_count, quality_score, specialty, query_normalized')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!stats || stats.length === 0) {
        return { hitRate: 0, totalEntries: 0, avgQualityScore: 0, topQueries: [] };
      }

      const totalHits = stats.reduce((sum, entry) => sum + entry.hit_count, 0);
      const hitRate = totalHits / stats.length;
      const avgQuality = stats.reduce((sum, entry) => sum + Number(entry.quality_score), 0) / stats.length;
      
      const topQueries = stats
        .sort((a, b) => b.hit_count - a.hit_count)
        .slice(0, 10);

      return {
        hitRate,
        totalEntries: stats.length,
        avgQualityScore: avgQuality,
        topQueries
      };
    } catch (error) {
      console.error('Failed to get cache metrics:', error);
      return { hitRate: 0, totalEntries: 0, avgQualityScore: 0, topQueries: [] };
    }
  }
}

export const monitoring = MonitoringService.getInstance();
export default MonitoringService;
