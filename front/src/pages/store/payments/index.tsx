import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { paymentsApi } from "@/services/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { Search, Calendar, Eye, Plus } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Pagination as ServerPagination } from "@/components/pagination"
import type { PaginatedApiResponse } from '@/types/api-response'
import type { Payment } from '@/types/payment'

export default function StorePayments() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useQuery<PaginatedApiResponse<Payment>>({
    queryKey: ["payments", { page, limit, search }],
      queryFn: () => paymentsApi.getAll({ page, limit, search }),
  })

  const payments = data?.data?.data || []
  const totalPages = Math.ceil((data?.data?.total || 0) / limit)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Ожидает", variant: "secondary" as const },
      paid: { label: "Оплачен", variant: "default" as const },
      overdue: { label: "Просрочен", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Платежи</h1>
            <p className="text-muted-foreground">Управление платежами по рассрочкам</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/store/payments/calendar")}>
              <Calendar className="mr-2 h-4 w-4" />
              Календарь
            </Button>
            <Button onClick={() => navigate("/store/installments")}>
              <Plus className="mr-2 h-4 w-4" />
              Новая рассрочка
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список платежей</CardTitle>
            <CardDescription>Все платежи по рассрочкам в вашем магазине</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по клиенту или номеру рассрочки..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="text-center py-8 text-red-500">Ошибка загрузки данных</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Платежи не найдены</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Рассрочка</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Дата платежа</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.installment?.customer?.name}</TableCell>
                        <TableCell>#{payment.installment?.id.slice(-8)}</TableCell>
                        <TableCell>{Number(payment.amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                        <TableCell>{format(new Date(payment.dueDate), "dd MMM yyyy", { locale: ru })}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/store/payments/${payment.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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
    </DashboardLayout>
  )
}
