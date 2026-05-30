import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { LoggerService } from './logger/logger.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })

  app.setGlobalPrefix('api')

  const logger = app.get(LoggerService)
  app.useLogger(logger)

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  logger.info(`Server running on http://localhost:${port}`, 'Bootstrap')
}
bootstrap()
