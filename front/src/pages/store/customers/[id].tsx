import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, User, Phone, MapPin, CreditCard, AlertTriangle, Edit, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customersApi, installmentsApi, checkBlacklist } from "@/services/api"
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"
import { AddToBlacklistForm } from '../../../components/forms/add-to-blacklist-form'
import { toast } from "react-toastify"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersApi.getOne(id as string),
    enabled: !!id,
  })

  const { data: customerInstallments } = useQuery({
    queryKey: ["customer-installments", id],
    queryFn: () => installmentsApi.getAll({ customerId: id as string }),
    enabled: !!id,
  })

  const { data: blacklist } = useQuery({
    queryKey: ['blacklist', customer?.passportSeries, customer?.passportNumber],
    queryFn: () => checkBlacklist(customer?.passportSeries, customer?.passportNumber),
    enabled: !!customer,
  })

  const blacklistMutation = useMutation({
    mutationFn: (isBlacklisted: boolean) => customersApi.updateBlacklist(id as string, isBlacklisted),
    onSuccess: (data, isBlacklisted) => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] })
      setIsBlacklistDialogOpen(false)
      toast.success(isBlacklisted ? "Клиент заблокирован" : "Клиент разблокирован")
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Клиент не найден</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Вернуться назад
          </Button>
        </div>
      </DashboardLayout>
    )
  }

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

  const totalInstallments = customerInstallments?.data?.length || 0
  const activeInstallments = customerInstallments?.data?.filter((i: { status: string }) => i.status === "active").length || 0
  const overdueInstallments = customerInstallments?.data?.filter((i: { status: string }) => i.status === "overdue").length || 0
  const totalAmount = customerInstallments?.data?.reduce((sum: number, i: { totalAmount: string }) => sum + Number(i.totalAmount), 0) || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {customer.lastName} {customer.firstName} {customer.middleName}
            </h1>
            <p className="text-gray-600">Профиль клиента #{customer.id.slice(-8)}</p>
          </div>
          <div className="flex items-center gap-2">
            {customer.isBlacklisted ? (
              <Badge className="bg-red-100 text-red-800">
                <Ban className="h-3 w-3 mr-1" />
                Заблокирован
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Активен
              </Badge>
            )}
          </div>
        </div>

        {/* Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего рассрочек</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstallments}</div>
              <p className="text-xs text-muted-foreground">За все время</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeInstallments}</div>
              <p className="text-xs text-muted-foreground">Текущие рассрочки</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Просрочки</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueInstallments}</div>
              <p className="text-xs text-muted-foreground">Требует внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общая сумма</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAmount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</div>
              <p className="text-xs text-muted-foreground">Всех рассрочек</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="installments">Рассрочки</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Личная информация</CardTitle>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {customer.lastName} {customer.firstName} {customer.middleName}
                      </p>
                      <p className="text-sm text-gray-600">ФИО</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{customer.phone}</p>
                      <p className="text-sm text-gray-600">Телефон</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{customer.address}</p>
                      <p className="text-sm text-gray-600">Адрес</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Паспортные данные</p>
                    <p className="font-medium">
                      {customer.passportSeries} {customer.passportNumber}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Дата регистрации</p>
                    <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/store/installments/create?customerId=${customer.id}`)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Создать рассрочку
                  </Button>

                  <Dialog open={isBlacklistDialogOpen} onOpenChange={setIsBlacklistDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant={customer.isBlacklisted ? "outline" : "destructive"} className="w-full">
                        <Ban className="h-4 w-4 mr-2" />
                        {customer.isBlacklisted ? "Разблокировать" : "Заблокировать"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {customer.isBlacklisted ? "Разблокировать клиента" : "Заблокировать клиента"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert variant={customer.isBlacklisted ? "default" : "destructive"}>
                          <AlertDescription>
                            {customer.isBlacklisted
                              ? "Клиент будет удален из черного списка и сможет оформлять новые рассрочки."
                              : "Клиент будет добавлен в черный список и не сможет оформлять новые рассрочки во всех магазинах сети."}
                          </AlertDescription>
                        </Alert>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsBlacklistDialogOpen(false)}>
                            Отмена
                          </Button>
                          <Button
                            variant={customer.isBlacklisted ? "default" : "destructive"}
                            onClick={() => blacklistMutation.mutate(!customer.isBlacklisted)}
                            disabled={blacklistMutation.isPending}
                          >
                            {customer.isBlacklisted ? "Разблокировать" : "Заблокировать"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {overdueInstallments > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        У клиента есть {overdueInstallments} просроченных рассрочек. Рекомендуется связаться с клиентом.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="installments">
            <Card>
              <CardHeader>
                <CardTitle>Рассрочки клиента</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Ежемесячно</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerInstallments?.data?.map((installment: { id: string; productName: string; totalAmount: string; monthlyPayment: string; status: string; createdAt: string }) => (
                      <TableRow key={installment.id}>
                        <TableCell className="font-medium">{installment.productName}</TableCell>
                        <TableCell>{Number(installment.totalAmount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                        <TableCell>{Number(installment.monthlyPayment).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                        <TableCell>{getStatusBadge(installment.status)}</TableCell>
                        <TableCell>{new Date(installment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/store/installments/${installment.id}`)}
                          >
                            Подробнее
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>История операций</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Клиент зарегистрирован</p>
                      <p className="text-sm text-gray-600">{new Date(customer.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {customerInstallments?.data?.map((installment: { id: string; productName: string; totalAmount: string; monthlyPayment: string; status: string; createdAt: string }) => (
                    <div key={installment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Создана рассрочка: {installment.productName}</p>
                        <p className="text-sm text-gray-600">{new Date(installment.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge variant="outline">{getStatusBadge(installment.status)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {blacklist?.blacklisted ? (
          <div className="text-red-600 font-semibold">Клиент в чёрном списке</div>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Добавить в чёрный список</Button>
            </DialogTrigger>
            <DialogContent>
              <AddToBlacklistForm
                passportSeries={customer.passportSeries}
                passportNumber={customer.passportNumber}
                customerId={customer.id}
                onSuccess={() => {
                  setOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
