/**
 * @fileoverview Rate limiting and security service
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limiting service
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  public readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up expired entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(identifier: string): {
    allowed: boolean;
    count: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let entry = this.store.get(identifier);

    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    // Check if request is allowed
    const allowed = entry.count < this.config.maxRequests;

    if (allowed) {
      entry.count++;
      this.store.set(identifier, entry);
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed,
      count: entry.count,
      remaining,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(identifier);
      }
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get current stats
   */
  getStats(): {
    totalIdentifiers: number;
    activeEntries: RateLimitEntry[];
  } {
    return {
      totalIdentifiers: this.store.size,
      activeEntries: Array.from(this.store.values()),
    };
  }
}

/**
 * Security utilities
 */
export class SecurityService {
  private rateLimiters: Map<string, RateLimiter> = new Map();

  constructor() {
    // Default rate limiters
    this.rateLimiters.set(
      'api',
      new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Too many API requests',
      }),
    );

    this.rateLimiters.set(
      'search',
      new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20,
        message: 'Too many search requests',
      }),
    );

    this.rateLimiters.set(
      'auth',
      new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        message: 'Too many authentication attempts',
      }),
    );
  }

  /**
   * Check rate limit for endpoint
   */
  checkRateLimit(
    endpoint: string,
    identifier: string,
  ): {
    allowed: boolean;
    count: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const limiter = this.rateLimiters.get(endpoint);
    if (!limiter) {
      return {
        allowed: true,
        count: 0,
        remaining: Infinity,
        resetTime: 0,
      };
    }

    return limiter.checkLimit(identifier);
  }

  /**
   * Add custom rate limiter
   */
  addRateLimiter(name: string, config: RateLimitConfig): void {
    this.rateLimiters.set(name, new RateLimiter(config));
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return input.replace(/[<>'"&]/g, (match) => {
      const entityMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      };
      return entityMap[match];
    });
  }

  /**
   * Validate API key format
   */
  validateApiKey(apiKey: string): boolean {
    // Simple API key validation
    return /^[a-zA-Z0-9_-]{32,}$/.test(apiKey);
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check for suspicious patterns in user input
   */
  detectSuspiciousInput(input: string): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let isSuspicious = false;

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
      /(UNION|OR|AND)\s+\d+\s*=\s*\d+/i,
      /['"]\s*(OR|AND)\s*['"]/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        reasons.push('Potential SQL injection');
        isSuspicious = true;
        break;
      }
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        reasons.push('Potential XSS attack');
        isSuspicious = true;
        break;
      }
    }

    // Check for path traversal
    if (input.includes('../') || input.includes('..\\')) {
      reasons.push('Potential path traversal');
      isSuspicious = true;
    }

    return { isSuspicious, reasons };
  }

  /**
   * Rate limit middleware for Next.js API routes
   */
  rateLimitMiddleware(endpoint: string) {
    return (req: any, res: any, next?: any) => {
      // Get identifier (IP address or user ID)
      const identifier = req.ip || req.connection.remoteAddress || 'unknown';

      const result = this.checkRateLimit(endpoint, identifier);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.rateLimiters.get(endpoint)?.config.maxRequests || 0);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (!result.allowed) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter);
        }

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: this.rateLimiters.get(endpoint)?.config.message || 'Too many requests',
          retryAfter: result.retryAfter,
        });
      }

      if (next) next();
    };
  }

  /**
   * Input validation middleware
   */
  inputValidationMiddleware() {
    return (req: any, res: any, next?: any) => {
      // Check query parameters
      for (const [key, value] of Object.entries(req.query || {})) {
        if (typeof value === 'string') {
          const check = this.detectSuspiciousInput(value);
          if (check.isSuspicious) {
            return res.status(400).json({
              error: 'Invalid input detected',
              field: key,
              reasons: check.reasons,
            });
          }
        }
      }

      // Check body parameters
      if (req.body && typeof req.body === 'object') {
        for (const [key, value] of Object.entries(req.body)) {
          if (typeof value === 'string') {
            const check = this.detectSuspiciousInput(value);
            if (check.isSuspicious) {
              return res.status(400).json({
                error: 'Invalid input detected',
                field: key,
                reasons: check.reasons,
              });
            }
          }
        }
      }

      if (next) next();
    };
  }
}

/**
 * Global security service instance
 */
export const securityService = new SecurityService();

/**
 * Rate limiting middleware
 */
export async function rateLimit(req: any, res: any, config?: RateLimitConfig): Promise<void> {
  const defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP, please try again later.',
  };

  const rateLimiter = new RateLimiter(config || defaultConfig);
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  const result = rateLimiter.checkLimit(clientIp);

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: (config || defaultConfig).message,
      retryAfter: result.retryAfter,
    });
    return;
  }

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': (config || defaultConfig).maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  });
}
