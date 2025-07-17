export interface DashboardStats {
  totalStores: number;
  activeStores: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalInstallments: number;
  activeInstallments: number;
  totalRevenue: number;
  revenueGrowth: number;
}

export interface Systemalerts {
  title: string;
  description: string;
  severity: string;
}
