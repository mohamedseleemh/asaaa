// Monitoring and logging utilities
export interface LogEntry {
  level: "info" | "warn" | "error" | "debug"
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
}

export class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private log(level: LogEntry["level"], message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    this.logs.push(entry)

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(entry)
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, context || "")
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log("error", message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context)
  }

  private async sendToMonitoring(entry: LogEntry) {
    // TODO: Implement monitoring service integration
    // Example: Sentry, LogRocket, or custom endpoint
  }

  getLogs(level?: LogEntry["level"]): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level)
    }
    return this.logs
  }
}

export const logger = Logger.getInstance()
