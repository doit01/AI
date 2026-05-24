export interface Order {
  id: number
  orderNumber: string
  customerName: string
  state: OrderState
  amount: number
  createTime: string
  updateTime: string
  paymentTimeoutSeconds?: number
}

export type OrderState = 'PENDING' | 'CONFIRMED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export type OrderEvent = 'CONFIRM' | 'PAY' | 'PROCESS' | 'SHIP' | 'DELIVER' | 'CANCEL' | 'REFUND'

export interface CreateOrderRequest {
  customerName: string
  amount: number
}

export interface SendEventRequest {
  event: OrderEvent
  headers?: Record<string, any>
}

export interface Transition {
  event: OrderEvent
  target: OrderState
}

export interface StateMachineInfo {
  orderId: number
  machineId: string
  currentState: OrderState
  availableEvents: Transition[]
}

export interface EventResponse {
  success: boolean
  orderId: number
  previousState: OrderState
  currentState: OrderState
  event: OrderEvent
  rejected: boolean
  rejectedReason?: string
  actionResult?: string
}

export interface StateMachineHistory {
  id: number
  machineId: string
  orderId: number
  fromState: OrderState | null
  toState: OrderState
  event: OrderEvent | null
  action: string
  result: boolean
  errorMessage: string | null
  createTime: string
}