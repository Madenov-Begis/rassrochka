import { useState } from 'react';
import { Plus, Search, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Zap } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { installmentsApi } from '@/services/api';
import { Pagination as ServerPagination } from '@/components/pagination';
import type { PaginatedApiResponse, ApiError } from '@/types/api-response';
import type { Installment } from '@/types/store/installments';
import { useDebounce } from '@/hooks/use-debounce';
import { useNavigate } from 'react-router-dom';
import { useStatsStore } from '@/store/stats-store';
import { useEffect } from 'react';
import { ImportModal } from '@/components/forms/import-modal';

export default function InstallmentsPage() {
  const [search, setSearch] = useState('');
  const debouncedValue = useDebounce(search, 400);
  const [status, setStatus] = useState('all'); // Updated default value to "all"
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data: installments, isLoading } = useQuery<
    PaginatedApiResponse<Installment[]>,
    ApiError
  >({
    queryKey: ['installments', { search: debouncedValue, status, page }],
    queryFn: () =>
      installmentsApi.getAll({ search: debouncedValue, status, page }),
  });

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    fetchStats,
  } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    const config = {
      active: {
        label: 'Активна',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />,
        description: 'Рассрочка активна, платежи по графику.',
      },
      completed: {
        label: 'Завершена',
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="w-4 h-4 mr-1 text-blue-600" />,
        description: 'Рассрочка полностью выплачена.',
      },
      overdue: {
        label: 'Просрочка',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />,
        description: 'Есть просроченные платежи! Требует внимания.',
      },
      early_payoff: {
        label: 'Досрочно',
        color: 'bg-purple-100 text-purple-800',
        icon: <Zap className="w-4 h-4 mr-1 text-purple-600" />,
        description: 'Рассрочка закрыта досрочно.',
      },
    };
    const c = config[status as keyof typeof config] || config.active;
    return (
      <Badge className={c.color} title={c.description}>
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Рассрочки</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Управление рассрочками магазина</p>
        </div>
        <Button className="gap-1 sm:gap-2 p-2 sm:px-4 sm:py-2" onClick={() => navigate('create')}>
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Новая рассрочка</span>
        </Button>
      </div>

      {/* Additional Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Дополнительные действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsImportOpen(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Импорт рассрочек
            </Button>
          </div>
        </CardContent>
      </Card>

      <ImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        type="installments"
        templateUrl="/docs/import-templates/installments_template.xlsx"
        endpoint="/api/client/import/installments"
      />

      {statsError && <div className="text-red-600">{statsError}</div>}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по товару или клиенту..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="overdue">Просрочки</SelectItem>
                <SelectItem value="early_payoff">Досрочные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Список рассрочек</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table className="min-w-[700px] sm:min-w-0 text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Товар</TableHead>
                  <TableHead className="whitespace-nowrap">Клиент</TableHead>
                  <TableHead className="whitespace-nowrap">Сумма</TableHead>
                  <TableHead className="whitespace-nowrap">Статус</TableHead>
                  <TableHead className="whitespace-nowrap">Дата оформления</TableHead>
                  <TableHead className="whitespace-nowrap">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : (
                  installments?.data?.items?.map((installment: Installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">
                        {installment.productName}
                      </TableCell>
                      <TableCell>
                        {installment.customer.firstName}{' '}
                        {installment.customer.lastName}
                      </TableCell>
                      <TableCell>
                        {Number(installment.totalAmount).toLocaleString('ru-RU', {
                          maximumFractionDigits: 0,
                        })}{' '}
                        UZS
                      </TableCell>
                      <TableCell>
                        {Number(installment.monthlyPayment).toLocaleString(
                          'ru-RU',
                          { maximumFractionDigits: 0 },
                        )}{' '}
                        UZS
                      </TableCell>
                      <TableCell>{getStatusBadge(installment.status)}</TableCell>
                      <TableCell>
                        {new Date(installment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/store/installments/${installment.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {installment.status === 'active' && (
                            <Button variant="ghost" size="sm">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <ServerPagination
            page={page}
            total={installments?.data?.totalPages || 0}
            limit={10}
            onPageChange={setPage}
            className="flex justify-center mt-6"
          />
        </CardContent>
      </Card>
    </div>
  );
}
