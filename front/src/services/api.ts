import axios from "axios"
import { useAuthStore } from "../store/auth-store"

const API_BASE = "http://localhost:3000"

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor: добавляет токен авторизации
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = config.headers || {}
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// Response interceptor: обработка 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// --- AUTH ---
export const authApi = {
  login: (credentials: { login: string; password: string }) =>
    api.post("api/auth/login", credentials).then((r) => r.data),
  me: () => api.get("api/auth/me").then((r) => r.data),
}

// --- ADMIN ---
export const adminApi = {
  // Stores
  getStores: (params?: Record<string, string | number>) =>
    api.get("api/admin/stores", { params }).then((r) => r.data),
  getStore: (id: string) => api.get(`api/admin/stores/${id}`).then((r) => r.data),
  createStore: (data: Record<string, unknown>) =>
    api.post("api/admin/stores", data).then((r) => r.data),
  updateStore: (id: string, data: Record<string, unknown>) =>
    api.put(`api/admin/stores/${id}`, data).then((r) => r.data),
  deleteStore: (id: string) => api.delete(`api/admin/stores/${id}`).then((r) => r.data),
  updateStoreStatus: (id: string, status: string) =>
    api.put(`api/admin/stores/${id}/status`, { status }).then((r) => r.data),
  getStoreStats: (id: string) => api.get(`api/admin/stores/${id}/stats`).then((r) => r.data),
  getStoreUsers: (id: string) => api.get(`api/admin/stores/${id}/users`).then((r) => r.data),
  getStoreInstallments: (id: string) => api.get(`api/admin/stores/${id}/installments`).then((r) => r.data),

  // Users
  getUsers: (params?: Record<string, string | number>) =>
    api.get("api/admin/users", { params }).then((r) => r.data),
  getUser: (id: string) => api.get(`api/admin/users/${id}`).then((r) => r.data),
  createUser: (data: Record<string, unknown>) =>
    api.post("api/admin/users", data).then((r) => r.data),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.put(`api/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  getUserActivity: (id: string) => api.get(`api/admin/users/${id}/activity`).then((r) => r.data),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put(`api/admin/users/${id}`, data).then((r) => r.data),

  // Stats
  getStats: () => api.get("api/admin/stats").then((r) => r.data),
  getTopStores: () => api.get("api/admin/stats/top-stores").then((r) => r.data),
  getSystemAlerts: () => api.get("api/admin/stats/alerts").then((r) => r.data),
}

// --- CLIENT ---
export const customersApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get("api/client/customers", { params }).then((r) => r.data),
  getOne: (id: string) => api.get(`api/client/customers/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post("api/client/customers", data).then((r) => r.data),
  updateBlacklist: (id: string, isBlacklisted: boolean) =>
    api.put(`api/client/customers/${id}/blacklist`, { isBlacklisted }).then((r) => r.data),
  searchByPassport: (passport: string) =>
    api.get(`api/client/customers/search`, { params: { passport } }).then((r) => r.data),
  searchByPassportGlobal: (passport: string) =>
    api.get(`api/client/customers/search-global`, { params: { passport } }).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`api/client/customers/${id}`, data).then((r) => r.data),
  getInstallments: (id: string, params?: Record<string, string | number>) =>
    api.get(`api/client/customers/${id}/installments`, { params }).then((r) => r.data),
}

export const installmentsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get("api/client/installments", { params }).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post("api/client/installments", data).then((r) => r.data),
  getOne: (id: string) => api.get(`api/client/installments/${id}`).then((r) => r.data),
  payOffEarly: (id: string) =>
    api.put(`api/client/installments/${id}/pay-off-early`).then((r) => r.data),
  getStats: () => api.get("api/client/stats").then((r) => r.data),
}

export const paymentsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get("api/client/payments", { params }).then((r) => r.data),
  getOne: (id: string) => api.get(`api/client/payments/${id}`).then((r) => r.data),
  getByInstallment: (installmentId: string) =>
    api.get(`api/client/installments/${installmentId}/payments`).then((r) => r.data),
  markPaid: (paymentId: string) =>
    api.put(`api/client/payments/${paymentId}/mark-paid`).then((r) => r.data),
  getOverdue: () => api.get("api/client/payments/overdue").then((r) => r.data),
  getUpcoming: () => api.get("api/client/payments/upcoming").then((r) => r.data),
}

