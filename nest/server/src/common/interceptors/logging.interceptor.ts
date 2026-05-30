import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, query, params } = request
    const now = Date.now()

    // 请求日志
    this.logger.log(`--> ${method} ${url}`)

    if (Object.keys(query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`)
    }
    if (Object.keys(params).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`)
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now
          const response = context.switchToHttp().getResponse()
          this.logger.log(`<-- ${method} ${url} ${response.statusCode} ${duration}ms`)
        },
        error: (error) => {
          const duration = Date.now() - now
          this.logger.error(`<-- ${method} ${url} ${duration}ms - ${error.message}`)
        },
      }),
    )
  }
}
