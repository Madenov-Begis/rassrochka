import { useState } from "react"
import { Plus, Search, Eye, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery } from "@tanstack/react-query"
import { installmentsApi } from "@/services/api"
import { Pagination as ServerPagination } from "@/components/pagination"

export default function InstallmentsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all") // Updated default value to "all"
  const [page, setPage] = useState(1)

  const { data: installments, isLoading } = useQuery({
    queryKey: ["installments", { search, status, page }],
    queryFn: () => installmentsApi.getAll({ search, status, page }),
  })

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Рассрочки</h1>
            <p className="text-gray-600">Управление рассрочками клиентов</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Новая рассрочка
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего рассрочек</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">189</div>
              <p className="text-xs text-muted-foreground">77% от общего числа</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Просрочки</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground text-red-600">Требует внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Сумма активных</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4М UZS</div>
              <p className="text-xs text-muted-foreground">+8% с прошлого месяца</p>
            </CardContent>
          </Card>
        </div>

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
            <CardTitle>Список рассрочек</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Ежемесячный платеж</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>Действия</TableHead>
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
                  installments?.data?.map((installment: { id: string; productName: string; totalAmount: string; monthlyPayment: string; status: string; createdAt: string; customer: { firstName: string; lastName: string } } ) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">{installment.productName}</TableCell>
                      <TableCell>
                        {installment.customer.firstName} {installment.customer.lastName}
                      </TableCell>
                      <TableCell>{Number(installment.totalAmount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                      <TableCell>{Number(installment.monthlyPayment).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                      <TableCell>{getStatusBadge(installment.status)}</TableCell>
                      <TableCell>{new Date(installment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {installment.status === "active" && (
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
            <ServerPagination
              page={page}
              total={installments?.total || 0}
              limit={10}
              onPageChange={setPage}
              className="flex justify-center mt-6"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
