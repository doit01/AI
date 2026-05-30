import {
  Controller,
  Get,
  Post,
  Param,
} from '@nestjs/common'
import { ConcurrencyService } from './concurrency.service'

@Controller('concurrency')
export class ConcurrencyController {
  constructor(private readonly concurrencyService: ConcurrencyService) {}

  /** 无保护 — 演示竞态 */
  @Post('increment-naive/:name')
  incrementNaive(@Param('name') name: string) {
    return this.concurrencyService.incrementNaive(name)
  }

  /** async-mutex 互斥锁 */
  @Post('increment-mutex/:name')
  incrementMutex(@Param('name') name: string) {
    return this.concurrencyService.incrementMutex(name)
  }

  /** SELECT FOR UPDATE 数据库行锁 */
  @Post('increment-locked/:name')
  incrementLocked(@Param('name') name: string) {
    return this.concurrencyService.incrementLocked(name)
  }

  /** 重置计数器 */
  @Post('reset/:name')
  resetCounter(@Param('name') name: string) {
    return this.concurrencyService.resetCounter(name)
  }

  /** 获取所有计数器 */
  @Get('counters')
  getAllCounters() {
    return this.concurrencyService.getAllCounters()
  }
}
