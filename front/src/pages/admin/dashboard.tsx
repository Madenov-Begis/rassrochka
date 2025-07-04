import { Store, Users, CreditCard, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/services/api"
import { useNavigate } from "react-router-dom"
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"

export default function AdminDashboard() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  })

  const { data: recentStores } = useQuery({
    queryKey: ["recent-stores"],
    queryFn: () => adminApi.getStores({ limit: 5 }),
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
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      payment_overdue: "bg-yellow-100 text-yellow-800",
      blocked: "bg-red-100 text-red-800",
    }

    const labels = {
      active: "Активен",
      payment_overdue: "Просрочка",
      blocked: "Заблокирован",
    }

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const networkTarget = 10000000 // 10M UZS цель сети на месяц
  const currentProgress = (stats?.totalRevenue / networkTarget) * 100 || 0

  return (
    <DashboardLayout>
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
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStores || 0}</div>
              <p className="text-xs text-muted-foreground">Активных: {stats?.activeStores || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.newUsersThisMonth || 0} за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Рассрочки</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalInstallments || 0}</div>
              <p className="text-xs text-muted-foreground">Активных: {stats?.activeInstallments || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Оборот сети</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.totalRevenue || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />+{stats?.revenueGrowth || 0}% к прошлому месяцу
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Network Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Прогресс сети к цели месяца</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {(stats?.totalRevenue || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS из {(networkTarget).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS
                </span>
                <span>{currentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Осталось {(networkTarget - (stats?.totalRevenue || 0)).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS до цели
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
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
                {systemAlerts.map((alert: any, index: number) => (
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
                {topStores?.map((store: any, index: number) => (
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

          {/* Recent Stores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Недавно добавленные магазины</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStores?.data?.map((store: any) => (
                    <TableRow
                      key={store.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/admin/stores/${store.id}`)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(store.status)}</TableCell>
                      <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
