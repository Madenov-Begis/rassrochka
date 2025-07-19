import {
  ArrowLeft,
  Store,
  Users,
  CreditCard,
  AlertTriangle,
  Settings,
  BarChart3,
  MapPin,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { DashboardSkeleton } from '@/components/loading/dashboard-skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreForm } from '../../../components/forms/store-form';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { useState } from 'react';
import { toast } from 'react-toastify';
import type { ApiError, ApiResponse } from '@/types/api-response';
import type { AdminStoreDetail } from '@/types/admin/store';
import type { Installment } from '@/types/store/installments';
import type { User } from '@/types/admin/user';
import { ImportModal } from '../../../components/forms/import-modal';

export default function StoreDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [importClientsOpen, setImportClientsOpen] = useState(false);
  const [importInstallmentsOpen, setImportInstallmentsOpen] = useState(false);
  const { data: store, isLoading } = useQuery<
    ApiResponse<AdminStoreDetail>,
    ApiError
  >({
    queryKey: ['admin-store', id],
    queryFn: () => adminApi.getStore(id as string),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      adminApi.updateStoreStatus(id as string, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store', id] });
      toast.success('Статус обновлен');
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Магазин не найден</h2>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Вернуться назад
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
    };

    const labels = {
      active: 'Активен',
      inactive: 'Неактивен',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getInstallmentStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      early_payoff: 'bg-purple-100 text-purple-800',
    };

    const labels = {
      active: 'Активна',
      completed: 'Завершена',
      overdue: 'Просрочка',
      early_payoff: 'Досрочно',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{store.data?.name}</h1>
          <p className="text-gray-600">
            Управление магазином #{String(store.data?.id).slice(-8)}
          </p>
        </div>
        {getStatusBadge(store.data?.status || '')}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportClientsOpen(true)}
        >
          Импорт клиентов
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setImportInstallmentsOpen(true)}
        >
          Импорт рассрочек
        </Button>
      </div>
      <ImportModal
        open={importClientsOpen}
        onOpenChange={setImportClientsOpen}
        type="clients"
        templateUrl="/docs/import-templates/clients_template.xlsx"
        endpoint="/admin/import/clients"
      />
      <ImportModal
        open={importInstallmentsOpen}
        onOpenChange={setImportInstallmentsOpen}
        type="installments"
        templateUrl="/docs/import-templates/installments_template.xlsx"
        endpoint="/admin/import/installments"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {store.data?.users?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Всего клиентов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рассрочки</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {store.data?.installments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Активных:{' '}
              {store.data?.installments?.filter(
                (i: Installment) => i.status === 'active',
              ).length || 0}
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
              {store.data?.installments?.filter(
                (i: Installment) => i.status === 'overdue',
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground text-red-600">
              Требует внимания
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Оборот</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                store.data?.installments?.reduce(
                  (sum: number, i: Installment) => sum + Number(i.totalAmount),
                  0,
                ) || 0
              ).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}{' '}
              UZS
            </div>
            <p className="text-xs text-muted-foreground">
              Общая сумма рассрочек
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="installments">Рассрочки</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Информация о магазине</CardTitle>
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <StoreForm
                      storeId={store.data?.id?.toString()}
                      initial={{
                        name: store.data?.name,
                        address: store.data?.address,
                        phone: store.data?.phone,
                        status: store.data?.status as 'active' | 'inactive',
                      }}
                      onSuccess={() => {
                        setEditOpen(false);
                        window.location.reload();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{store.data?.name}</p>
                    <p className="text-sm text-gray-600">Название магазина</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{store.data?.address}</p>
                    <p className="text-sm text-gray-600">Адрес</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{store.data?.phone}</p>
                    <p className="text-sm text-gray-600">Телефон</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Дата создания</p>
                  <p className="font-medium">
                    {new Date(store.data?.createdAt || '').toLocaleDateString()}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Последнее обновление
                  </p>
                  <p className="font-medium">
                    {new Date(store.data?.updatedAt || '').toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Управление статусом</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текущий статус</label>
                  <Select
                    value={store.data?.status || ''}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate(value)
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="inactive">Неактивен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {store.data?.status === 'inactive' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Магазин неактивен. Новые рассрочки недоступны.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(`/admin/stores/${store.data?.id}/settings`)
                    }
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки магазина
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Пользователи магазина</CardTitle>
              <Button
                onClick={() =>
                  navigate(`/admin/users/create?storeId=${store.data?.id}`)
                }
              >
                <Users className="h-4 w-4 mr-2" />
                Добавить пользователя
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Логин</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.data?.users?.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.login}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role === 'store_manager'
                            ? 'Менеджер'
                            : 'Администратор'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installments">
          <Card>
            <CardHeader>
              <CardTitle>Рассрочки магазина</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.data?.installments?.map((installment: Installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">
                        {installment.productName}
                      </TableCell>
                      <TableCell>
                        {installment.customer.firstName}{' '}
                        {installment.customer.lastName}
                      </TableCell>
                      <TableCell>
                        {(Number(installment.totalAmount) || 0).toLocaleString(
                          'ru-RU',
                          { maximumFractionDigits: 0 },
                        )}{' '}
                        UZS
                      </TableCell>
                      <TableCell>
                        {getInstallmentStatusBadge(installment.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(installment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Подробнее
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {store?.data?.installments?.length &&
                store?.data?.installments?.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline">
                      Показать все ({store.data?.installments?.length})
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Здесь можно реализовать аналитику по месяцам, используя store.installments */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ товары</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Здесь можно реализовать топ товаров по количеству и сумме, используя store.installments */}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
