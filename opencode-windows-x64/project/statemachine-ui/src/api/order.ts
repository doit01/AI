import type { Order, CreateOrderRequest, StateMachineInfo, EventResponse, StateMachineHistory } from '../types'

const API_BASE = 'http://localhost:8080/api/orders'

export const orderApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const res = await fetch(API_BASE)
    if (!res.ok) throw new Error('Failed to fetch orders')
    return res.json()
  },

  getOrder: async (id: number): Promise<Order> => {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) throw new Error('Failed to fetch order')
    return res.json()
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create order')
    return res.json()
  },

  sendEvent: async (id: number, event: string, headers?: Record<string, any>): Promise<EventResponse> => {
    const res = await fetch(`${API_BASE}/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, headers: headers || {} })
    })
    if (!res.ok) throw new Error('Failed to send event')
    return res.json()
  },

  getStateMachineInfo: async (id: number): Promise<StateMachineInfo> => {
    const res = await fetch(`${API_BASE}/${id}/info`)
    if (!res.ok) throw new Error('Failed to get state machine info')
    return res.json()
  },

  getOrderHistory: async (id: number): Promise<StateMachineHistory[]> => {
    const res = await fetch(`${API_BASE}/${id}/history`)
    if (!res.ok) throw new Error('Failed to get order history')
    return res.json()
  }
}