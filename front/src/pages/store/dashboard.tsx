import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  Users,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { installmentsApi, paymentsApi } from '@/services/api';
import { DashboardSkeleton } from '@/components/loading/dashboard-skeleton';
import type { StoreChats } from '@/types/store/dashboard';
import type { ApiError, ApiResponse } from '@/types/api-response';

export default function StoreDashboard() {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<ApiResponse<StoreChats>, ApiError>({
    queryKey: ['store-stats'],
    queryFn: () => installmentsApi.getStats(),
  });

  const { data: upcomingPayments } = useQuery({
    queryKey: ['upcoming-payments'],
    queryFn: () => paymentsApi.getUpcoming(),
  });

  const { data: overduePayments } = useQuery({
    queryKey: ['overdue-payments'],
    queryFn: () => paymentsApi.getOverdue(),
  });

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Дашборд магазина
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Краткая статистика и быстрые действия
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Рассрочки */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего рассрочек
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.data?.totalInstallments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.data?.newThisMonth || 0} за этот месяц
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.data?.activeInstallments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(Number(stats?.data?.activeInstallments) /
                Number(stats?.data?.totalInstallments)) *
                100 || 0}
              % от общего числа
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просрочки</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.data?.overdueInstallments || 0}
            </div>
            <p className="text-xs text-muted-foreground text-red-600">
              Требует внимания
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Оборот за месяц
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.data?.monthlyRevenue || 0).toLocaleString('ru-RU', {
                maximumFractionDigits: 0,
              })}{' '}
              UZS
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />+
              {stats?.data?.revenueGrowth || 0}% к прошлому месяцу
            </p>
          </CardContent>
        </Card>
        {/* Клиенты */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего клиентов
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.data?.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Клиентов в системе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные клиенты
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.data?.activeCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Без просрочек и не в чёрном списке
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">С просрочками</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.data?.overdueCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Есть просроченные рассрочки
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              В чёрном списке
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.data?.blacklistedCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Заблокированы</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Installments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние рассрочки</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/store/installments')}
            >
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
              <TableBody></TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Предстоящие платежи</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/store/payments/calendar')}
            >
              Календарь
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments?.data?.items
                ?.slice(0, 5)
                .map((payment: {
                  id: string;
                  amount: number | string;
                  dueDate: string;
                  installment: {
                    customer: {
                      firstName: string;
                      lastName: string;
                    };
                  };
                }) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {payment.installment.customer.firstName}{' '}
                          {payment.installment.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {Number(payment.amount).toLocaleString('ru-RU', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        UZS
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.ceil(
                          (new Date(payment.dueDate).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24),
                        )}{' '}
                        дн.
                      </p>
                    </div>
                  </div>
                )) || (
                <div className="text-center py-4 text-gray-500">
                  Нет предстоящих платежей
                </div>
              )}
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
              Просроченные платежи ({overduePayments?.data?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.isArray(overduePayments?.data?.items) && overduePayments.data.items.slice(0, 3).map((payment: {
                id: string;
                amount: number | string;
                dueDate: string;
                installment: {
                  customer: {
                    firstName: string;
                    lastName: string;
                    phone: string;
                  };
                };
              }) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div>
                    <p className="font-medium">
                      {payment.installment.customer.firstName}{' '}
                      {payment.installment.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payment.installment.customer.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {Number(payment.amount).toLocaleString('ru-RU', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      UZS
                    </p>
                    <p className="text-xs text-red-500">
                      {Math.ceil(
                        (Date.now() - new Date(payment.dueDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{' '}
                      дн. просрочки
                    </p>
                  </div>
                </div>
              ))}
              {overduePayments?.data?.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/store/payments?status=overdue')}
                  >
                    Показать все ({overduePayments?.data?.length || 0})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
