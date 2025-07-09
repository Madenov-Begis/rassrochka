import { useState } from "react"
import { Plus, Search, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery } from "@tanstack/react-query"
import { customersApi } from "@/services/api"
import { CreateOrEditCustomerForm } from "@/components/forms/create-customer-form"
import { Pagination as ServerPagination } from "@/components/pagination"
import { useDebounce } from "@/hooks/use-debounce"
import { useNavigate } from "react-router-dom"

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  isBlacklisted: boolean;
  store?: { name: string };
  installments?: Array<{ status: string }>;
  phone?: string;
  passportSeries?: string;
  passportNumber?: string;
  createdAt?: string;
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", { search: debouncedSearch, page }],
    queryFn: () => customersApi.getAll({ search: debouncedSearch, page }),
  })

  const getCustomerStatus = (customer: { isBlacklisted: boolean; installments?: Array<{ status: string }> }) => {
    if (customer.isBlacklisted) {
      return <Badge className="bg-red-100 text-red-800">Черный список</Badge>
    }

    const hasOverdue = customer.installments?.some((inst) => inst.status === "overdue")
    if (hasOverdue) {
      return <Badge className="bg-yellow-100 text-yellow-800">Есть просрочки</Badge>
    }

    return <Badge className="bg-green-100 text-green-800">Активен</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Клиенты</h1>
            <p className="text-gray-600">Управление базой клиентов магазина</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("search-passport")}>Глобальный поиск по паспорту</Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить клиента
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новый клиент</DialogTitle>
                </DialogHeader>
                <CreateOrEditCustomerForm onSuccess={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего клиентов</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers?.total || 0}</div>
              <p className="text-xs text-muted-foreground">+12% с прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">89% от общего числа</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">С просрочками</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground text-yellow-600">Требует внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Черный список</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground text-red-600">Заблокированы</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Поиск клиентов</CardTitle>
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
            <CardTitle>Список клиентов</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Паспорт</TableHead>
                  <TableHead>Рассрочки</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата регистрации</TableHead>
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
                  customers?.data?.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.lastName} {customer.firstName} {customer.middleName}
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        {customer.passportSeries} {customer.passportNumber}
                      </TableCell>
                      <TableCell>{customer.installments?.length || 0}</TableCell>
                      <TableCell>{getCustomerStatus(customer)}</TableCell>
                      <TableCell>{customer.createdAt ? new Date(String(customer.createdAt)).toLocaleDateString() : ''}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`${customer.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <ServerPagination
              page={page}
              total={customers?.total || 0}
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
