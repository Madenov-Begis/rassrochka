import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CreditCard, DollarSign, User, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { installmentsApi, paymentsApi } from "@/services/api"
import { toast } from "react-toastify"

export default function InstallmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEarlyPayoffOpen, setIsEarlyPayoffOpen] = useState(false)

  const { data: installment, isLoading } = useQuery({
    queryKey: ["installment", id],
    queryFn: () => installmentsApi.getOne(id as string),
    enabled: !!id,
  })

  const { data: payments } = useQuery({
    queryKey: ["payments", id],
    queryFn: () => paymentsApi.getByInstallment(id as string),
    enabled: !!id,
  })

  const markPaidMutation = useMutation({
    mutationFn: paymentsApi.markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", id] })
      queryClient.invalidateQueries({ queryKey: ["installment", id] })
      toast.success("Платеж отмечен как оплаченный")
    },
  })

  const earlyPayoffMutation = useMutation({
    mutationFn: installmentsApi.payOffEarly,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["installment", id] })
      queryClient.invalidateQueries({ queryKey: ["payments", id] })
      setIsEarlyPayoffOpen(false)
      toast.success(`Остаток к доплате: ₽${data.remainingAmount.toLocaleString()}`)
    },
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

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    }

    const labels = {
      pending: "Ожидает",
      paid: "Оплачен",
      overdue: "Просрочка",
      cancelled: "Отменен",
    }

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!installment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Рассрочка не найдена</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Вернуться назад
          </Button>
        </div>
      </DashboardLayout>
    )
  }

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
            <h1 className="text-3xl font-bold">{installment.productName}</h1>
            <p className="text-gray-600">Детали рассрочки #{installment.id.slice(-8)}</p>
          </div>
          {getStatusBadge(installment.status)}
        </div>

        {/* Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Клиент</CardTitle>
              <User className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-semibold">
                {installment.customer.lastName} {installment.customer.firstName}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                {installment.customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                {installment.customer.address}
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Финансы</CardTitle>
              <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Стоимость:</span>
                <span className="font-medium">{Number(installment.productPrice).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Первый взнос:</span>
                <span className="font-medium">{Number(installment.downPayment).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Процентная ставка:</span>
                <span className="font-medium">{Number(installment.interestRate)}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Общая сумма:</span>
                <span className="font-bold">{Number(installment.totalAmount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Платежи</CardTitle>
              <CreditCard className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Ежемесячно:</span>
                <span className="font-medium">{Number(installment.monthlyPayment).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Срок:</span>
                <span className="font-medium">{installment.months} мес.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Оплачено:</span>
                <span className="font-medium text-green-600">
                  {payments?.data?.filter((p: { status: string }) => p.status === "paid").length || 0} из {installment.months}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm">Создана:</span>
                <span className="font-medium">{new Date(installment.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {installment.status === "active" && (
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Dialog open={isEarlyPayoffOpen} onOpenChange={setIsEarlyPayoffOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Досрочное погашение</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Досрочное погашение рассрочки</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          При досрочном погашении клиент доплачивает только основную сумму без процентов. Все
                          неоплаченные платежи будут отменены.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEarlyPayoffOpen(false)}>
                          Отмена
                        </Button>
                        <Button
                          onClick={() => earlyPayoffMutation.mutate(installment.id)}
                          disabled={earlyPayoffMutation.isPending}
                        >
                          Подтвердить
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>График платежей</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№</TableHead>
                  <TableHead>Дата платежа</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата оплаты</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.data?.map((payment: { id: string; dueDate: string; amount: string; status: string; paidDate: string }, index: number) => (
                  <TableRow key={payment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{Number(payment.amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      {payment.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => markPaidMutation.mutate(payment.id)}
                          disabled={markPaidMutation.isPending}
                        >
                          Отметить оплаченным
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
