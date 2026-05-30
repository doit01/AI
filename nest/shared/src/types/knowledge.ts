/** 知识库条目 */
export interface Knowledge {
  id: number
  title: string
  content: string
  category: string
  tags: string | null
  sort: number
  status: number
  createdAt: string
  updatedAt: string
}

/** 知识库按分类分组 */
export interface KnowledgeGroup {
  category: string
  label: string
  icon: string
  items: Knowledge[]
}

/** 计数器（并发演示用） */
export interface Counter {
  id: number
  name: string
  value: number
  version: number
}
