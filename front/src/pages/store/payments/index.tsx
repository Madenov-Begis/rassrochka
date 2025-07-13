import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { paymentsApi } from "@/services/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/loading/table-skeleton"
import { Search, Calendar, Eye, Plus } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Pagination as ServerPagination } from "@/components/pagination"
import type { PaginatedApiResponse, ApiError } from '@/types/api-response'
import type { Payment } from "@/types/store/payments"

export default function StorePayments() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useQuery<PaginatedApiResponse<Payment[]>, ApiError>({
    queryKey: ["payments", { page, limit, search }],
      queryFn: () => paymentsApi.getAll({ page, limit, search }),
  })

  const payments = data?.data?.items || []
  const totalPages = Math.ceil((data?.data?.total || 0) / limit)

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        label: "Ожидает",
        color: "bg-gray-100 text-gray-800",
        icon: <Clock className="w-4 h-4 mr-1 text-gray-500" />,
        description: "Платеж ожидает оплаты."
      },
      paid: {
        label: "Оплачен",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />,
        description: "Платеж успешно оплачен."
      },
      overdue: {
        label: "Просрочен",
        color: "bg-red-100 text-red-800",
        icon: <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />,
        description: "Платеж просрочен! Требует внимания."
      },
    };
    const c = config[status as keyof typeof config] || config.pending;
    return (
      <Badge className={c.color} title={c.description}>
        {c.icon}
        {c.label}
      </Badge>
    );
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
                        <TableCell className="font-medium">{payment.installment?.customer?.firstName} {payment.installment?.customer?.lastName} {payment.installment?.customer?.middleName ? ` ${payment.installment?.customer?.middleName}` : ""}</TableCell>
                        <TableCell>#{payment.installment?.id}</TableCell>
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
