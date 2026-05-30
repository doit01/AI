import { Injectable, NotFoundException } from '@nestjs/common'
import { Mutex } from 'async-mutex'
import { PrismaService } from '../prisma/prisma.service'

/**
 * 并发控制演示服务
 *
 * 提供三种自增方式，用于前台对比展示:
 *  1. incrementNaive  — 无保护，出现竞态
 *  2. incrementMutex  — async-mutex 应用层互斥锁
 *  3. incrementLocked — SELECT FOR UPDATE 数据库行锁
 */
@Injectable()
export class ConcurrencyService {
  /** 应用层互斥锁: 按计数器名隔离 */
  private readonly mutexes = new Map<string, Mutex>()
  private readonly delay = 50 // 模拟业务处理耗时 (ms)

  constructor(private readonly prisma: PrismaService) {}

  // ─── 1. 无保护: 读→改→写 三步拆开，间隙可被并发插入 ──

  async incrementNaive(name: string) {
    let counter = await this.prisma.counter.findUnique({ where: { name } })
    if (!counter) {
      counter = await this.prisma.counter.create({ data: { name, value: 0 } })
    }

    // 模拟耗时 — 放大竞态窗口
    await this.sleep(this.delay)

    return this.prisma.counter.update({
      where: { name },
      data: { value: counter.value + 1 },
    })
  }

  // ─── 2. async-mutex: 同一进程内串行化 ──

  async incrementMutex(name: string) {
    let mutex = this.mutexes.get(name)
    if (!mutex) {
      mutex = new Mutex()
      this.mutexes.set(name, mutex)
    }

    return mutex.runExclusive(async () => {
      let counter = await this.prisma.counter.findUnique({ where: { name } })
      if (!counter) {
        counter = await this.prisma.counter.create({ data: { name, value: 0 } })
      }

      await this.sleep(this.delay)

      return this.prisma.counter.update({
        where: { name },
        data: { value: counter.value + 1 },
      })
    })
  }

  // ─── 3. SELECT FOR UPDATE: 数据库行级锁 ──

  async incrementLocked(name: string) {
    return this.prisma.$transaction(async (tx) => {
      let counter = await tx.counter.findUnique({ where: { name } })
      if (!counter) {
        counter = await tx.counter.create({ data: { name, value: 0 } })
      }

      // 行锁: 显式锁住该行，其他事务的 FOR UPDATE 等待
      const [locked] = await tx.$queryRawUnsafe<{ value: number }[]>(
        'SELECT value FROM counters WHERE name = $1 FOR UPDATE',
        name,
      )

      await this.sleep(this.delay)

      const newValue = locked.value + 1
      await tx.counter.update({ where: { name }, data: { value: newValue } })
      return tx.counter.findUnique({ where: { name } })
    })
  }

  // ─── 辅助 ──

  async getCounter(name: string) {
    const c = await this.prisma.counter.findUnique({ where: { name } })
    if (!c) throw new NotFoundException(`计数器 "${name}" 不存在`)
    return c
  }

  async resetCounter(name: string) {
    const c = await this.prisma.counter.findUnique({ where: { name } })
    if (!c) throw new NotFoundException(`计数器 "${name}" 不存在`)
    return this.prisma.counter.update({ where: { name }, data: { value: 0 } })
  }

  async getAllCounters() {
    return this.prisma.counter.findMany({ orderBy: { name: 'asc' } })
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
