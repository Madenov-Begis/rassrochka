import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CreditCard, User, DollarSign, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentsApi, installmentsApi } from "@/services/api"
import { DashboardSkeleton } from "@/components/loading/dashboard-skeleton"
import { toast } from "react-toastify"

export default function PaymentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false)

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentsApi.getOne(id as string),
    enabled: !!id,
  })

  const { data: installment } = useQuery({
    queryKey: ["installment", payment?.installmentId],
    queryFn: () => installmentsApi.getOne(payment.installmentId),
    enabled: !!payment?.installmentId,
  })

  const markPaidMutation = useMutation({
    mutationFn: paymentsApi.markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment", id] })
      queryClient.invalidateQueries({ queryKey: ["installment", payment?.installmentId] })
      setIsMarkPaidOpen(false)
      toast.success("Платеж оплачен")
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  if (!payment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Платеж не найден</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Вернуться назад
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    }

    const labels = {
      pending: "Ожидает оплаты",
      paid: "Оплачен",
      overdue: "Просрочен",
      cancelled: "Отменен",
    }

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const isOverdue = payment.status === "pending" && new Date(payment.dueDate) < new Date()
  const daysOverdue = isOverdue
    ? Math.ceil((Date.now() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

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
            <h1 className="text-3xl font-bold">Платеж #{payment.id.slice(-8)}</h1>
            <p className="text-gray-600">Детали платежа</p>
          </div>
          {getStatusBadge(payment.status)}
        </div>

        {/* Alert for overdue */}
        {isOverdue && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Платеж просрочен на {daysOverdue} {daysOverdue === 1 ? "день" : daysOverdue < 5 ? "дня" : "дней"}.
              Рекомендуется связаться с клиентом.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Info */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Информация о платеже</CardTitle>
              <CreditCard className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Сумма:</span>
                <span className="font-bold text-lg">{Number(payment.amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Дата платежа:</span>
                <span className="font-medium">{new Date(payment.dueDate).toLocaleDateString()}</span>
              </div>

              {payment.paidDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Дата оплаты:</span>
                  <span className="font-medium text-green-600">{new Date(payment.paidDate).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Статус:</span>
                {getStatusBadge(payment.status)}
              </div>

              {isOverdue && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Просрочка:</span>
                  <span className="font-medium text-red-600">{daysOverdue} дн.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          {installment && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Клиент</CardTitle>
                <User className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">
                    {installment.customer.lastName} {installment.customer.firstName}
                  </p>
                  <p className="text-sm text-gray-600">ФИО</p>
                </div>

                <div>
                  <p className="font-medium">{installment.customer.phone}</p>
                  <p className="text-sm text-gray-600">Телефон</p>
                </div>

                <div>
                  <p className="font-medium">{installment.customer.address}</p>
                  <p className="text-sm text-gray-600">Адрес</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => navigate(`/store/customers/${installment.customer.id}`)}
                >
                  Профиль клиента
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Installment Info */}
          {installment && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Рассрочка</CardTitle>
                <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{installment.productName}</p>
                  <p className="text-sm text-gray-600">Товар</p>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Общая сумма:</span>
                  <span className="font-medium">{Number(installment.totalAmount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ежемесячно:</span>
                  <span className="font-medium">{Number(installment.monthlyPayment).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Срок:</span>
                  <span className="font-medium">{installment.months} мес.</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => navigate(`/store/installments/${installment.id}`)}
                >
                  Детали рассрочки
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        {payment.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Отметить как оплаченный
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Подтвердить оплату</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          Вы уверены, что хотите отметить этот платеж как оплаченный? Это действие нельзя будет
                          отменить.
                        </AlertDescription>
                      </Alert>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span>Сумма платежа:</span>
                          <span className="font-bold">{Number(payment.amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Дата оплаты:</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsMarkPaidOpen(false)}>
                          Отмена
                        </Button>
                        <Button
                          onClick={() => markPaidMutation.mutate(payment.id)}
                          disabled={markPaidMutation.isPending}
                        >
                          {markPaidMutation.isPending ? "Обработка..." : "Подтвердить оплату"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {installment?.customer && (
                  <Button variant="outline">
                    <a href={`tel:${installment.customer.phone}`} className="flex items-center">
                      Позвонить клиенту
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>История платежа</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Платеж создан</p>
                  <p className="text-sm text-gray-600">{new Date(payment.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {payment.status === "paid" && payment.paidDate && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Платеж оплачен</p>
                    <p className="text-sm text-gray-600">{new Date(payment.paidDate).toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}

              {isOverdue && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Платеж просрочен</p>
                    <p className="text-sm text-gray-600">
                      Просрочка с {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
