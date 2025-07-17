import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Filter,
  Eye,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
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
import { TableSkeleton } from '@/components/loading/table-skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Pagination as ServerPagination } from '@/components/pagination';
import type { PaginatedApiResponse, ApiError } from '@/types/api-response';
import type { Payment } from '@/types/store/payments';

export default function StorePayments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery<
    PaginatedApiResponse<Payment[]>,
    ApiError
  >({
    queryKey: ['payments', { page, limit, search, statusFilter }],
    queryFn: () => {
      const params: Record<string, string | number> = { page, limit, search };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      return paymentsApi.getAll(params);
    },
  });

  const payments = data?.data?.items || [];

  // Статистика
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        label: 'Ожидает',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-4 h-4 mr-1" />,
        description: 'Платеж ожидает оплаты.',
      },
      paid: {
        label: 'Оплачен',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-4 h-4 mr-1" />,
        description: 'Платеж успешно оплачен.',
      },
      overdue: {
        label: 'Просрочен',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="w-4 h-4 mr-1" />,
        description: 'Платеж просрочен! Требует внимания.',
      },
    };
    const c = config[status as keyof typeof config] || config.pending;
    return (
      <Badge className={`${c.color} border`} title={c.description}>
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Просрочен на ${Math.abs(diffDays)} дн.`;
    } else if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Завтра';
    } else {
      return `Через ${diffDays} дн.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Платежи</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Управление и отслеживание платежей по рассрочкам
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/store/installments')}>
            <Plus className="mr-2 h-4 w-4" />
            Новая рассрочка
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Список платежей</CardTitle>
          <CardDescription>
            Управляйте и отслеживайте все платежи по рассрочкам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по клиенту, товару или номеру рассрочки..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">Ожидают оплаты</SelectItem>
                  <SelectItem value="paid">Оплачены</SelectItem>
                  <SelectItem value="overdue">Просрочены</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
              <p className="text-gray-600">Не удалось загрузить данные платежей</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Платежи не найдены</h3>
              <p className="text-gray-600">
                {search || statusFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Создайте первую рассрочку, чтобы появились платежи'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table className="min-w-[800px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Клиент</TableHead>
                      <TableHead className="whitespace-nowrap">Товар</TableHead>
                      <TableHead className="whitespace-nowrap">Сумма платежа</TableHead>
                      <TableHead className="whitespace-nowrap">Статус</TableHead>
                      <TableHead className="whitespace-nowrap">Дата платежа</TableHead>
                      <TableHead className="whitespace-nowrap">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: Payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {payment.installment?.customer?.lastName}{' '}
                                {payment.installment?.customer?.firstName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payment.installment?.customer?.phone}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.installment?.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              Рассрочка #{payment.installment?.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-lg">
                            {Number(payment.amount).toLocaleString('ru-RU')}
                          </div>
                          <div className="text-sm text-muted-foreground">UZS</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(payment.status)}
                            {payment.status === 'pending' && (
                              <div className="text-xs text-muted-foreground">
                                {getDaysUntilDue(payment.dueDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {format(new Date(payment.dueDate), 'dd MMM yyyy', {
                                locale: ru,
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(payment.dueDate), 'EEEE', {
                                locale: ru,
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/store/payments/${payment.id}`)
                              }
                              title="Просмотреть детали"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  navigate(`/store/payments/${payment.id}`)
                                }
                                title="Оплатить"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Оплатить
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <ServerPagination
                page={page}
                total={data?.data?.total || 0}
                limit={limit}
                onPageChange={setPage}
                className="flex justify-center mt-6"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
