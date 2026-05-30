import type { Counter } from '@nest/shared'
import api from '.'

export function getAllCounters() {
  return api.get<Counter[]>('/concurrency/counters')
}

export function incrementNaive(name: string) {
  return api.post(`/concurrency/increment-naive/${name}`)
}

export function incrementMutex(name: string) {
  return api.post(`/concurrency/increment-mutex/${name}`)
}

export function incrementLocked(name: string) {
  return api.post(`/concurrency/increment-locked/${name}`)
}

export function resetCounter(name: string) {
  return api.post(`/concurrency/reset/${name}`)
}
