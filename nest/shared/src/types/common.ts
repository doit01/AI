/** 通用 API 响应包装 */
export interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T
}

/** 分页查询结果 */
export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 分页查询参数 */
export interface PaginationQuery {
  page?: number
  pageSize?: number
}
