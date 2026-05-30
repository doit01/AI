import type { KnowledgeGroup } from '@nest/shared'
import api from '.'

export function getKnowledge() {
  return api.get<KnowledgeGroup[]>('/knowledge')
}

export function getKnowledgeById(id: number) {
  return api.get(`/knowledge/${id}`)
}
