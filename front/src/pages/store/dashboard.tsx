import { useNavigate } from "react-router-dom"
import { Calendar, CreditCard, Users, AlertTriangle, TrendingUp, DollarSign, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery } from "@tanstack/react-query"
import { installmentsApi, paymentsApi } from "@/services/api"
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"

export default function StoreDashboard() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["store-stats"],
    queryFn: () => installmentsApi.getStats(),
  })

  const { data: recentInstallments } = useQuery({
    queryKey: ["recent-installments"],
    queryFn: () => installmentsApi.getAll({ limit: 5 }),
  })

  const { data: upcomingPayments } = useQuery({
    queryKey: ["upcoming-payments"],
    queryFn: () => paymentsApi.getUpcoming(),
  })

  const { data: overduePayments } = useQuery({
    queryKey: ["overdue-payments"],
    queryFn: () => paymentsApi.getOverdue(),
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
      completed: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
      early_payoff: "bg-purple-100 text-purple-800",
    }

    const labels = {
      active: "Активна",
      completed: "Завершена",
      overdue: "Просрочка",
      early_payoff: "Досрочно",
    }

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const monthlyTarget = 10000000 // 10M UZS цель на месяц
  const currentProgress = (stats?.monthlyRevenue / monthlyTarget) * 100 || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Дашборд магазина</h1>
            <p className="text-gray-600">Обзор текущей деятельности и показателей</p>
          </div>
          <Button onClick={() => navigate("/store/installments/create")}>
            <CreditCard className="h-4 w-4 mr-2" />
            Новая рассрочка
          </Button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего рассрочек</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalInstallments || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.newThisMonth || 0} за этот месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.activeInstallments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {((stats?.activeInstallments / stats?.totalInstallments) * 100 || 0).toFixed(1)}% от общего числа
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Просрочки</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overduePayments?.length || 0}</div>
              <p className="text-xs text-muted-foreground text-red-600">Требует внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Оборот за месяц</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats?.monthlyRevenue || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />+{stats?.revenueGrowth || 0}% к прошлому месяцу
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Goal */}
        <Card>
          <CardHeader>
            <CardTitle>Прогресс к цели месяца</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {(stats?.monthlyRevenue || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS из {(monthlyTarget).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS
                </span>
                <span>{currentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Осталось {(monthlyTarget - (stats?.monthlyRevenue || 0)).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS до цели
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Installments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Последние рассрочки</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/store/installments")}>
                Все рассрочки
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInstallments?.data?.map((installment: any) => (
                    <TableRow
                      key={installment.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/store/installments/${installment.id}`)}
                    >
                      <TableCell className="font-medium">{installment.productName}</TableCell>
                      <TableCell>
                        {installment.customer.firstName} {installment.customer.lastName}
                      </TableCell>
                      <TableCell>{(Number(installment.totalAmount)).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                      <TableCell>{getStatusBadge(installment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Предстоящие платежи</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/store/payments/calendar")}>
                Календарь
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments?.data?.slice(0, 5).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {payment.installment.customer.firstName} {payment.installment.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{new Date(payment.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(Number(payment.amount)).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</p>
                      <p className="text-xs text-gray-600">
                        {Math.ceil((new Date(payment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} дн.
                      </p>
                    </div>
                  </div>
                )) || <div className="text-center py-4 text-gray-500">Нет предстоящих платежей</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Payments Alert */}
        {overduePayments?.data && overduePayments?.data?.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Просроченные платежи ({overduePayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overduePayments?.data?.slice(0, 3).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <p className="font-medium">
                        {payment.installment.customer.firstName} {payment.installment.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{payment.installment.customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{(Number(payment.amount)).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</p>
                      <p className="text-xs text-red-500">
                        {Math.ceil((Date.now() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} дн.
                        просрочки
                      </p>
                    </div>
                  </div>
                ))}
                {overduePayments?.data?.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/store/payments?status=overdue")}>
                      Показать все ({overduePayments.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col bg-transparent"
                onClick={() => navigate("/store/customers/create")}
              >
                <Users className="h-6 w-6 mb-2" />
                Новый клиент
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col bg-transparent"
                onClick={() => navigate("/store/installments/create")}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                Новая рассрочка
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col bg-transparent"
                onClick={() => navigate("/store/payments/calendar")}
              >
                <Calendar className="h-6 w-6 mb-2" />
                Календарь платежей
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col bg-transparent"
                onClick={() => navigate("/store/stats")}
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                Статистика
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
