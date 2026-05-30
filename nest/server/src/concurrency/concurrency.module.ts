import { Module } from '@nestjs/common'
import { ConcurrencyController } from './concurrency.controller'
import { ConcurrencyService } from './concurrency.service'

@Module({
  controllers: [ConcurrencyController],
  providers: [ConcurrencyService],
  exports: [ConcurrencyService],
})
export class ConcurrencyModule {}
