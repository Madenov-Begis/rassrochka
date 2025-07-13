import { useState, useEffect } from "react"
import { Plus, Search, Settings, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/services/api"
import { useNavigate } from "react-router-dom"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { StoreModal } from '../../../components/forms/store-modal';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useDebounce } from "@/hooks/use-debounce";
import { Pagination as ServerPagination } from "@/components/pagination";
import type { ApiError, PaginatedApiResponse } from "@/types/api-response"
import type { Store } from "@/types/admin/store"

export default function AdminStoresPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation<string, unknown, string>({
    mutationFn: adminApi.deleteStore,
    onSuccess: () => {
      toast.success('Магазин удалён');
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
    },
    onError: (e) => {
      const err = e as AxiosError<{ statusCode: number; message?: string; errors?: Record<string, string[]> }>;
      const data = err?.response?.data;
      if (data?.errors) {
        const errors = data.errors as Record<string, string[]>;
        const details = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('\n');
        toast.error('Ошибка удаления:\n' + details);
      } else {
        toast.error('Ошибка удаления: ' + (data?.message || err.message));
      }
    },
  });

  const { data: storesData, isLoading } = useQuery<PaginatedApiResponse<Store[]>, ApiError>({
    queryKey: ["admin-stores", { search: debouncedSearch, page }],
    queryFn: () => adminApi.getStores({ search: debouncedSearch, page, limit: 10 }).then((r) => r.data),
  })


  const stores = storesData?.data?.items || [];
  const totalStores = storesData?.data?.total || 0;
  const limit = 10;
  const activeStores = stores.filter((store) => store.status === "active").length;
  const overdueStores = stores.filter((store) => store.status === "payment_overdue").length;
  const blockedStores = stores.filter((store) => store.status === "blocked").length;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Магазины</h1>
            <p className="text-gray-600">Управление сетью магазинов</p>
          </div>
          <StoreModal
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSuccess={() => { setCreateOpen(false); window.location.reload(); }}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить магазин
              </Button>
            }
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего магазинов</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStores}</div>
              <p className="text-xs text-muted-foreground">В сети</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStores}</div>
              <p className="text-xs text-muted-foreground">
                {totalStores > 0 ? Math.round((activeStores / totalStores) * 100) : 0}% от общего числа
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">С просрочкой</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueStores}</div>
              <p className="text-xs text-muted-foreground text-yellow-600">Требует внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заблокированные</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockedStores}</div>
              <p className="text-xs text-muted-foreground text-red-600">Критично</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Поиск</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по названию или адресу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stores Table */}
        <Card>
          <CardHeader>
            <CardTitle>Список магазинов</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Адрес</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Пользователи</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow
                      key={store.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/admin/stores/${store.id}`)}
                    >
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>{store.phone}</TableCell>
                      <TableCell>{getStatusBadge(store.status)}</TableCell>
                      <TableCell>{store.users}</TableCell>
                      <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/stores/${store.id}`)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/stores/${store.id}?tab=analytics`)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Удалить магазин?')) deleteMutation.mutate(store.id);
                            }}
                            disabled={deleteMutation.status === 'pending'}
                          >
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        <ServerPagination
          page={page}
          total={totalStores}
          limit={limit}
          onPageChange={setPage}
          className="flex justify-center mt-6"
        />
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
