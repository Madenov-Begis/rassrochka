/**
 * @file: stats-store.ts
 * @description: Zustand store для статистики дашборда (installments, payments, суммы)
 * @dependencies: Zustand, installmentsApi
 * @created: 2024-07-12
 */
import { create } from 'zustand'
import { installmentsApi } from '@/services/api'
import type { ApiError } from '@/types/api-response'

export interface Stats {
  totalInstallments: number
  activeInstallments: number
  completedInstallments: number
  overdueInstallments: number
  newThisMonth: number
  monthlyRevenue: number
  revenueGrowth: number
  overduePayments: number
  totalActiveAmount: number
}

interface StatsState {
  stats: Stats | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await installmentsApi.getStats()
      set({ stats: data, isLoading: false })
    } catch (e) {
      const err = e as ApiError
      set({ error: err?.message || 'Ошибка загрузки статистики', isLoading: false })
    }
  },
})) 