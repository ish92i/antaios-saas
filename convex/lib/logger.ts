type LogLevel = "debug" | "info" | "warn" | "error"

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel =
  typeof process !== "undefined" &&
  process.env?.LOG_LEVEL &&
  process.env.LOG_LEVEL in LOG_LEVELS
    ? (process.env.LOG_LEVEL as LogLevel)
    : "info"

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

class Logger {
  private context: Record<string, unknown>
  private defaultModule?: string

  constructor(context: Record<string, unknown> = {}, defaultModule?: string) {
    this.context = context
    this.defaultModule = defaultModule
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    if (!shouldLog(level)) return

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (this.defaultModule) {
      entry.module = this.defaultModule
    }

    if (level === "error") {
      entry.stack = new Error().stack ?? undefined
    }

    const mergedMeta = { ...this.context, ...meta }
    if (mergedMeta && Object.keys(mergedMeta).length > 0) {
      entry.meta = mergedMeta
    }

    const output = JSON.stringify(entry)

    switch (level) {
      case "error":
        console.error(output)
        break
      case "warn":
        console.warn(output)
        break
      default:
        console.log(output)
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log("debug", message, meta)
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta)
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta)
  }

  withContext(context: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...context }, this.defaultModule)
  }
}

export const logger = new Logger()
