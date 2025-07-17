/**
 * @file: search-passport.tsx
 * @description: Глобальный поиск клиента по паспорту (по всем магазинам), детальный результат
 * @dependencies: React, Zustand, TanStack Query, shadcn/ui
 * @created: 2025-07-03
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Ban, Search } from 'lucide-react';
import { customersApi } from '@/services/api';
import type { GlobalSearchPassport } from '@/types/store/customers';
import type { ApiError, ApiResponse } from '@/types/api-response';

export default function SearchPassportPage() {
  const [series, setSeries] = useState('');
  const [number, setNumber] = useState('');
  const [searchParams, setSearchParams] = useState<{
    series: string;
    number: string;
  } | null>(null);

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery<ApiResponse<GlobalSearchPassport>, ApiError>({
    queryKey: ['passport-global-search', searchParams],
    queryFn: () =>
      customersApi.searchByPassportGlobal({
        series: searchParams?.series || '',
        number: searchParams?.number || '',
      }),
    enabled: !!searchParams,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (series.match(/^[A-Z]{2}$/i) && number.match(/^\d{7}$/)) {
      setSearchParams({ series, number });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8 text-xs sm:text-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Глобальный поиск по паспорту</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 items-end">
            <div>
              <label className="block text-xs mb-1">Серия</label>
              <Input
                value={series}
                onChange={(e) => setSeries(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))}
                maxLength={2}
                placeholder="AA"
                required
                pattern="[A-Z]{2}"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Номер</label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 7))}
                maxLength={7}
                placeholder="1234567"
                required
                pattern="\d{7}"
              />
            </div>
            <Button type="submit" className="h-10">
              <Search className="w-4 h-4 mr-2" />
              Искать
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center text-muted-foreground py-8">Поиск...</div>
      )}
      {isError && (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>
            Ошибка поиска:{' '}
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </AlertDescription>
        </Alert>
      )}
      {result && Array.isArray(result.data) && result.data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Клиент с таким паспортом не найден ни в одном магазине
        </div>
      )}
      {result && Array.isArray(result.data) && result.data.length > 0 && (
        <div className="space-y-8">
          {result.data.map((block: GlobalSearchPassport) => {
            return (
              <Card
                key={block.store.id}
                className={block.isBlacklisted ? 'border-red-500' : ''}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {block.store.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Магазин #{block.store.id.toString().slice(-6)}
                    </div>
                  </div>
                  {block.installments?.some(
                    (i) => i.status === 'overdue' || i.status === 'pending',
                  ) && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Есть просрочки
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="flex-1 space-y-1">
                      <div className="font-bold text-lg">
                        {block.lastName} {block.firstName} {block.middleName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {block.phone}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {block.isBlacklisted ? (
                        <Badge className="bg-red-100 text-red-800">
                          <Ban className="h-3 w-3 mr-1" />В чёрном списке
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Активен
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Рассрочки:</div>
                    {block.installments?.length === 0 ? (
                      <div className="text-muted-foreground">
                        Нет рассрочек в этом магазине
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Товар</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Дата</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {block.installments.map((i) => (
                            <TableRow
                              key={i.id}
                              className={
                                i.status === 'overdue' ? 'bg-red-50' : ''
                              }
                            >
                              <TableCell>{i.productName}</TableCell>
                              <TableCell>
                                {Number(i.totalAmount).toLocaleString('ru-RU', {
                                  maximumFractionDigits: 0,
                                })}{' '}
                                UZS
                              </TableCell>
                              <TableCell>
                                <Badge>
                                  {i.status === 'overdue'
                                    ? 'Просрочка'
                                    : i.status === 'active'
                                    ? 'Активна'
                                    : 'Завершена'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(i.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
