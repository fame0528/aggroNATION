/**
 * @fileoverview Performance monitoring and analytics
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface APIEndpointMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

/**
 * Performance monitoring service
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: APIEndpointMetrics[] = [];
  private maxMetricsSize = 1000;

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    metadata?: Record<string, any>,
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep metrics size under control
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics.shift();
    }
  }

  /**
   * Record API endpoint performance
   */
  recordAPIMetric(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userAgent?: string,
    ip?: string,
  ): void {
    const metric: APIEndpointMetrics = {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
      userAgent,
      ip,
    };

    this.apiMetrics.push(metric);

    // Keep metrics size under control
    if (this.apiMetrics.length > this.maxMetricsSize) {
      this.apiMetrics.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    general: {
      totalMetrics: number;
      avgResponseTime: number;
      errorRate: number;
    };
    endpoints: Array<{
      endpoint: string;
      avgResponseTime: number;
      requestCount: number;
      errorCount: number;
      errorRate: number;
    }>;
    recentMetrics: PerformanceMetric[];
  } {
    // Calculate general stats
    const totalMetrics = this.apiMetrics.length;
    const avgResponseTime =
      totalMetrics > 0
        ? this.apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalMetrics
        : 0;

    const errorCount = this.apiMetrics.filter((m) => m.statusCode >= 400).length;
    const errorRate = totalMetrics > 0 ? (errorCount / totalMetrics) * 100 : 0;

    // Calculate endpoint stats
    const endpointMap = new Map<string, APIEndpointMetrics[]>();
    this.apiMetrics.forEach((metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, []);
      }
      endpointMap.get(key)!.push(metric);
    });

    const endpoints = Array.from(endpointMap.entries()).map(([endpoint, metrics]) => {
      const requestCount = metrics.length;
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / requestCount;
      const errorCount = metrics.filter((m) => m.statusCode >= 400).length;
      const errorRate = (errorCount / requestCount) * 100;

      return {
        endpoint,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        requestCount,
        errorCount,
        errorRate: Math.round(errorRate * 100) / 100,
      };
    });

    // Sort endpoints by request count
    endpoints.sort((a, b) => b.requestCount - a.requestCount);

    return {
      general: {
        totalMetrics,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
      },
      endpoints,
      recentMetrics: this.metrics.slice(-50),
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.apiMetrics = [];
  }

  /**
   * Middleware for automatic API performance tracking
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const originalEnd = res.end;

      res.end = (...args: any[]) => {
        const responseTime = Date.now() - startTime;

        this.recordAPIMetric(
          req.url || req.originalUrl,
          req.method,
          responseTime,
          res.statusCode,
          req.get('User-Agent'),
          req.ip || req.connection.remoteAddress,
        );

        originalEnd.apply(res, args);
      };

      if (next) next();
    };
  }
}

/**
 * Timer utility for measuring execution time
 */
export class Timer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  /**
   * Stop timer and record metric
   */
  stop(monitor: PerformanceMonitor, metadata?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;
    monitor.recordMetric(this.name, duration, 'ms', metadata);
    return duration;
  }

  /**
   * Get elapsed time without stopping
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Helper function to time async operations
 */
export async function timeOperation<T>(
  name: string,
  operation: () => Promise<T>,
  monitor: PerformanceMonitor,
  metadata?: Record<string, any>,
): Promise<T> {
  const timer = new Timer(name);
  try {
    const result = await operation();
    timer.stop(monitor, { ...metadata, success: true });
    return result;
  } catch (error) {
    timer.stop(monitor, { ...metadata, success: false, error: (error as Error).message });
    throw error;
  }
}

/**
 * System resource monitoring
 */
export function getSystemMetrics(): {
  memory: NodeJS.MemoryUsage;
  uptime: number;
  cpu: {
    user: number;
    system: number;
  };
} {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const cpuUsage = process.cpuUsage();

  return {
    memory: memoryUsage,
    uptime,
    cpu: {
      user: cpuUsage.user / 1000000, // Convert to seconds
      system: cpuUsage.system / 1000000,
    },
  };
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();
