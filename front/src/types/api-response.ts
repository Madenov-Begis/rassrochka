/**
 * @file: api-response.ts
 * @description: Универсальный тип-обёртка для всех API-ответов (успех и ошибка)
 * @dependencies: -
 * @created: 2024-07-05
 */

export interface ApiSuccess<T> {
  statusCode: number
  data: T
  message?: string
}

export interface ApiError {
  statusCode: number
  data: null
  message: string
  errors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedData<T> {
  items: T
  total: number
  page: number
  totalPages: number
  [key: string]: unknown
}

export type ResponseWithMessage = ApiSuccess<{ message: string }>

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>