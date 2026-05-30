import { Injectable } from '@nestjs/common'
import * as winston from 'winston'

@Injectable()
export class LoggerService {
  private logger: winston.Logger

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? `[${context}]` : ''
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
          return `${timestamp} ${level.toUpperCase()} ${ctx} ${message}${metaStr}`
        }),
      ),
      transports: [
        new winston.transports.Console({ format: winston.format.colorize() }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    })
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, { context: optionalParams[0] })
  }

  info(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, ...meta })
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context })
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { context, ...meta })
  }
}
