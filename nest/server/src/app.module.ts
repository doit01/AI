import { Module, ValidationPipe as NestValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { LoggerModule } from './logger/logger.module'
import { AuthModule } from './auth/auth.module'
import { DepartmentModule } from './department/department.module'
import { UserModule } from './user/user.module'
import { RoleModule } from './role/role.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { PermissionGuard } from './common/guards/permission.guard'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    LoggerModule,
    AuthModule,
    DepartmentModule,
    UserModule,
    RoleModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new NestValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
