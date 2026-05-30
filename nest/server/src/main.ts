import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { LoggerService } from './logger/logger.service'
import { LogLevel } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const levelMap: Record<string, LogLevel[]> = {
  error: ['error'],
  warn: ['error', 'warn'],
  info: ['error', 'warn', 'log'],
  debug: ['error', 'warn', 'log', 'debug'],
  verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // ── NestJS 内置日志级别 ──
  const logLevel = (configService.get<string>('log.level') || 'info') as keyof typeof levelMap
  app.useLogger(levelMap[logLevel] ?? levelMap.info)

  // ── CORS (支持逗号分隔多源) ──
  const corsOrigin = configService.get<string>('cors.origin', 'http://localhost:5173')
  app.enableCors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })

  // ── 全局路由前缀 ──
  app.setGlobalPrefix(configService.get<string>('app.apiPrefix', 'api'))

  // ── 应用日志（Winston）──
  const logger = app.get(LoggerService)
  app.useLogger(logger)

  const port = configService.get<number>('port', 3000)
  await app.listen(port)
  logger.info(`Server running on http://localhost:${port}`, 'Bootstrap')
}
bootstrap()
