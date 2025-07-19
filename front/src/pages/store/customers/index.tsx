import { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/services/api';
import { CreateOrEditCustomerForm } from '@/components/forms/create-customer-form';
import { Pagination as ServerPagination } from '@/components/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { useNavigate } from 'react-router-dom';
import type { ApiError, PaginatedApiResponse } from '@/types/api-response';
import type { Customer } from '@/types/store/customers';
import { ImportModal } from '@/components/forms/import-modal';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const { data: customers, isLoading } = useQuery<
    PaginatedApiResponse<Customer[]>,
    ApiError
  >({
    queryKey: ['customers', { search: debouncedSearch, page }],
    queryFn: () => customersApi.getAll({ search: debouncedSearch, page }),
  });

  const getCustomerStatus = (customer: {
    isBlacklisted: boolean;
    installments?: Array<{ status: string }>;
  }) => {
    if (customer.isBlacklisted) {
      return <Badge className="bg-red-100 text-red-800">Черный список</Badge>;
    }

    const hasOverdue = customer.installments?.some(
      (inst) => inst.status === 'overdue',
    );
    if (hasOverdue) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Есть просрочки</Badge>
      );
    }

    return <Badge className="bg-green-100 text-green-800">Активен</Badge>;
  };

  const isSuccess =
    customers && customers.statusCode === 200 && !!customers.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Клиенты</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Управление базой клиентов магазина</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1 sm:gap-2 p-2 sm:px-4 sm:py-2">
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Добавить клиента</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новый клиент</DialogTitle>
            </DialogHeader>
            <CreateOrEditCustomerForm
              onSuccess={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Additional Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Дополнительные действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => navigate('search-passport')} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Глобальный поиск по паспорту
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Импорт клиентов
            </Button>
          </div>
        </CardContent>
      </Card>

      <ImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        type="clients"
        templateUrl="/public/Шаблон для клиентов.xlsx"
        endpoint="/api/client/import/clients"
      />

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg md:text-2xl'>Поиск клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по ФИО, телефону или паспорту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Список клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table className="min-w-[700px] sm:min-w-0 text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ФИО</TableHead>
                  <TableHead className="whitespace-nowrap">Телефон</TableHead>
                  <TableHead className="whitespace-nowrap">Паспорт</TableHead>
                  <TableHead className="whitespace-nowrap">Рассрочки</TableHead>
                  <TableHead className="whitespace-nowrap">Статус</TableHead>
                  <TableHead className="whitespace-nowrap">Дата регистрации</TableHead>
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
                ) : isSuccess ? (
                  customers?.data?.items?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.lastName} {customer.firstName}{' '}
                        {customer.middleName}
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        {customer.passportSeries} {customer.passportNumber}
                      </TableCell>
                      <TableCell>{customer.installments?.length || 0}</TableCell>
                      <TableCell>{getCustomerStatus(customer)}</TableCell>
                      <TableCell>
                        {customer.createdAt
                          ? new Date(
                              String(customer.createdAt),
                            ).toLocaleDateString()
                          : ''}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`${customer.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-red-500"
                    >
                      Ошибка загрузки данных
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ServerPagination
            page={page}
            total={isSuccess ? customers.data.total : 0}
            limit={10}
            onPageChange={setPage}
            className="flex justify-center mt-6"
          />
        </CardContent>
      </Card>
    </div>
  );
}
