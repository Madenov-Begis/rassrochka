import { Store as StoreIcon, Users, CreditCard, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/services/api"
import { useNavigate } from "react-router-dom"
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"
import type { TopStore } from "@/types/admin/store"
import type { SystemAlert } from "@/types/admin/system-alert"

export default function AdminDashboard() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  })



  const { data: topStores } = useQuery({
    queryKey: ["top-stores"],
    queryFn: () => adminApi.getTopStores(),
  })

  const { data: systemAlerts } = useQuery({
    queryKey: ["system-alerts"],
    queryFn: () => adminApi.getSystemAlerts(),
  })

  if (statsLoading) {
    return (
        <DashboardSkeleton />
      )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Административная панель</h1>
            <p className="text-gray-600">Управление сетью магазинов InstallmentPro</p>
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего магазинов</CardTitle>
              <StoreIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data?.totalStores || 0}</div>
              <p className="text-xs text-muted-foreground">Активных: {stats?.data?.activeStores || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.data?.newUsersThisMonth || 0} за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Рассрочки</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data?.totalInstallments || 0}</div>
              <p className="text-xs text-muted-foreground">Активных: {stats?.data?.activeInstallments || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Оборот сети</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.data?.totalRevenue || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />+{stats?.data?.revenueGrowth || 0}% к прошлому месяцу
              </p>
            </CardContent>
          </Card>
        </div>

        {systemAlerts && systemAlerts.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Системные уведомления ({systemAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemAlerts.map((alert: SystemAlert, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                    <Badge variant={alert.severity === "high" ? "destructive" : "outline"}>
                      {alert.severity === "high" ? "Критично" : "Внимание"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Stores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Топ магазины по обороту</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/stores")}>
                Все магазины
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topStores?.data.map((store: TopStore, index: number) => (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-gray-600">{store.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(store.revenue).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</p>
                      <p className="text-xs text-gray-600">{store.installments} рассрочек</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
