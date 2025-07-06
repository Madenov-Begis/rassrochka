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
import { CreateCustomerForm } from "@/components/forms/create-customer-form"
import { Pagination as ServerPagination } from "@/components/pagination"
import { useDebounce } from "@/hooks/use-debounce"

interface CustomerWithStoreAndInstallments {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  isBlacklisted: boolean;
  store?: { name: string };
  installments?: { status: string }[];
}

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Глобальный поиск по паспорту
  const [globalPassportSeries, setGlobalPassportSeries] = useState("")
  const [globalPassportNumber, setGlobalPassportNumber] = useState("")
  const [globalPassportTouched, setGlobalPassportTouched] = useState(false)
  const [globalPassportError, setGlobalPassportError] = useState("")
  const [globalPassportQuery, setGlobalPassportQuery] = useState("")

  const debouncedSearch = useDebounce(search, 400)

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", { search: debouncedSearch, page }],
    queryFn: () => customersApi.getAll({ search: debouncedSearch, page }),
  })

  const {
    data: globalPassportResults,
    isLoading: isGlobalPassportLoading,
    refetch: refetchGlobalPassport,
  } = useQuery< CustomerWithStoreAndInstallments[] | null >({
    queryKey: ["customers-global-passport", globalPassportQuery],
    queryFn: async () => {
      if (!globalPassportQuery) return null
      return customersApi.searchByPassportGlobal(globalPassportQuery)
    },
    enabled: !!globalPassportQuery,
  })

  const getCustomerStatus = (customer: any) => {
    if (customer.isBlacklisted) {
      return <Badge className="bg-red-100 text-red-800">Черный список</Badge>
    }

    const hasOverdue = customer.installments?.some((inst: any) => inst.status === "overdue")
    if (hasOverdue) {
      return <Badge className="bg-yellow-100 text-yellow-800">Есть просрочки</Badge>
    }

    return <Badge className="bg-green-100 text-green-800">Активен</Badge>
  }

  const handleGlobalPassportSearch = () => {
    setGlobalPassportTouched(true)
    // Валидация: серия — 2 латинские буквы, номер — 7 цифр
    if (!/^[A-Z]{2}$/i.test(globalPassportSeries)) {
      setGlobalPassportError("Серия паспорта: 2 латинские буквы")
      return
    }
    if (!/^\d{7}$/.test(globalPassportNumber)) {
      setGlobalPassportError("Номер паспорта: 7 цифр")
      return
    }
    setGlobalPassportError("")
    setGlobalPassportQuery(`${globalPassportSeries.toUpperCase()} ${globalPassportNumber}`)
    refetchGlobalPassport()
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
              <CreateCustomerForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
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

        {/* Глобальный поиск по паспорту */}
        <Card>
          <CardHeader>
            <CardTitle>Глобальный поиск по паспорту (по всем магазинам)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2 items-end">
              <div>
                <Input
                  placeholder="Серия (AA)"
                  value={globalPassportSeries}
                  maxLength={2}
                  onChange={e => setGlobalPassportSeries(e.target.value.toUpperCase())}
                  className="w-24"
                />
              </div>
              <div>
                <Input
                  placeholder="Номер (1234567)"
                  value={globalPassportNumber}
                  maxLength={7}
                  onChange={e => setGlobalPassportNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-32"
                />
              </div>
              <Button onClick={handleGlobalPassportSearch}>
                Проверить
              </Button>
            </div>
            {globalPassportTouched && globalPassportError && (
              <p className="text-sm text-red-600 mt-2">{globalPassportError}</p>
            )}
            {/* Результаты поиска */}
            {isGlobalPassportLoading && <p className="mt-2">Поиск...</p>}
            {globalPassportResults && (
              <div className="mt-4 space-y-2">
                {globalPassportResults.length === 0 ? (
                  <p className="text-green-700">Клиент с таким паспортом не найден ни в одном магазине.</p>
                ) : (
                  <>
                    <p className="font-semibold">Найдено в магазинах:</p>
                    <ul className="space-y-1">
                      {globalPassportResults.map((c) => (
                        <li key={c.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center gap-2">
                          <span className="font-medium">{c.lastName} {c.firstName} {c.middleName} ({c.store?.name})</span>
                          {c.isBlacklisted && <Badge className="bg-red-100 text-red-800 ml-2">Чёрный список</Badge>}
                          {c.installments?.some((i) => i.status === "overdue") && (
                            <Badge className="bg-yellow-100 text-yellow-800 ml-2">Есть просрочки</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                  customers?.data?.map((customer: any) => (
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
                      <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
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
