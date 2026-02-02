/**
 * Security event logger for tracking authentication events
 * In production, this would send to a logging service
 */

type SecurityEventType =
  | 'LOGIN_TOKEN_GENERATED'
  | 'LOGIN_TOKEN_USED'
  | 'LOGIN_TOKEN_EXPIRED'
  | 'LOGIN_TOKEN_ALREADY_USED'
  | 'LOGIN_TOKEN_INVALID'
  | 'LOGIN_ATTEMPT_FAILED'
  | 'LOGIN_SUCCESS'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'

interface SecurityEvent {
  type: SecurityEventType
  timestamp: string
  agentId?: string
  ip?: string
  userAgent?: string
  details?: Record<string, unknown>
}

class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 1000 // Keep last 1000 events in memory

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    }

    // Add to memory buffer
    this.events.push(fullEvent)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[SECURITY]', fullEvent.type, fullEvent)
    }

    // In production, you would send to a logging service
    // e.g., Datadog, CloudWatch, etc.
  }

  getRecentEvents(count: number = 100): SecurityEvent[] {
    return this.events.slice(-count)
  }

  getEventsByAgent(agentId: string, count: number = 50): SecurityEvent[] {
    return this.events
      .filter((e) => e.agentId === agentId)
      .slice(-count)
  }

  getEventsByType(type: SecurityEventType, count: number = 50): SecurityEvent[] {
    return this.events
      .filter((e) => e.type === type)
      .slice(-count)
  }
}

export const securityLogger = new SecurityLogger()

// Convenience functions
export function logLoginTokenGenerated(agentId: string, ip?: string): void {
  securityLogger.log({
    type: 'LOGIN_TOKEN_GENERATED',
    agentId,
    ip,
  })
}

export function logLoginSuccess(agentId: string, ip?: string, userAgent?: string): void {
  securityLogger.log({
    type: 'LOGIN_SUCCESS',
    agentId,
    ip,
    userAgent,
  })
}

export function logLoginFailed(
  reason: 'expired' | 'already_used' | 'invalid' | 'rate_limit',
  agentId?: string,
  ip?: string
): void {
  const typeMap = {
    expired: 'LOGIN_TOKEN_EXPIRED',
    already_used: 'LOGIN_TOKEN_ALREADY_USED',
    invalid: 'LOGIN_TOKEN_INVALID',
    rate_limit: 'RATE_LIMIT_EXCEEDED',
  } as const

  securityLogger.log({
    type: typeMap[reason],
    agentId,
    ip,
  })
}

export function logLogout(agentId: string): void {
  securityLogger.log({
    type: 'LOGOUT',
    agentId,
  })
}
