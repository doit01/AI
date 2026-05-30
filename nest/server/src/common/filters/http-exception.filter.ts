import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception')
  private isProd: boolean

  constructor(private configService?: ConfigService) {
    this.isProd = configService?.get<boolean>('isProd') ?? process.env.NODE_ENV === 'production'
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse()
      message = typeof res === 'string' ? res : (res as any).message ?? exception.message
    }

    // 记录错误日志
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} ${message}`,
        exception instanceof Error ? exception.stack : '',
      )
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} ${message}`)
    }

    // 生产环境隐藏内部错误详情，防止信息泄露
    const isServerError = status >= 500
    const responseBody: Record<string, any> = {
      success: false,
      code: status,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
    }
    if (this.isProd && isServerError) {
      responseBody.message = '服务器内部错误'
    }

    response.status(status).json(responseBody)
  }
}
