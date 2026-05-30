import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  /** 获取所有分类列表 */
  async getCategories() {
    const items = await this.prisma.knowledge.findMany({
      where: { status: 1 },
      orderBy: [{ category: 'asc' }, { sort: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        sort: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    /** 分类元数据: 按 category 分组的显示名和图标 */
    const categoryMeta: Record<string, { label: string; icon: string }> = {
      architecture: { label: '项目架构', icon: '📐' },
      nestjs: { label: 'NestJS 核心', icon: '⚡' },
      prisma: { label: 'Prisma ORM', icon: '🗄️' },
      frontend: { label: 'Vue 3 前端', icon: '🎨' },
      auth: { label: '认证与权限', icon: '🔐' },
      patterns: { label: '设计模式', icon: '📋' },
      logging: { label: '日志系统', icon: '📝' },
      pitfalls: { label: '常见陷阱', icon: '⚠️' },
    }

    // 按 category 分组
    const groups = new Map<string, typeof items>()
    for (const item of items) {
      const list = groups.get(item.category) ?? []
      list.push(item)
      groups.set(item.category, list)
    }

    // 输出指定排序的分组
    const categoryOrder = ['architecture', 'nestjs', 'prisma', 'frontend', 'auth', 'patterns', 'logging', 'pitfalls']

    return categoryOrder
      .filter((cat) => groups.has(cat))
      .map((cat) => ({
        category: cat,
        label: categoryMeta[cat]?.label ?? cat,
        icon: categoryMeta[cat]?.icon ?? '📌',
        items: groups.get(cat)!,
      }))
  }

  /** 获取单条知识 */
  async findOne(id: number) {
    return this.prisma.knowledge.findUnique({ where: { id } })
  }
}
