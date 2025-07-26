import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { installmentsApi, paymentsApi } from '@/services/api';
import { toast } from 'react-toastify';
import type { ApiError, ApiResponse } from '@/types/api-response';
import type { Installment } from '@/types/store/installments';
import type { Payment } from '@/types/store/payments';
import { PaymentTimelineItem } from '@/components/forms/PaymentTimelineItem';
import { InputAmount } from '@/components/ui/input-amount';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/services/api';

export default function InstallmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEarlyPayoffOpen, setIsEarlyPayoffOpen] = useState(false);
  const [payModal, setPayModal] = useState<{
    open: boolean;
    paymentId: number | null;
  }>({ open: false, paymentId: null });
  const [payAmount, setPayAmount] = useState<string>('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string>('');

  const { data: installment, isLoading } = useQuery<ApiResponse<Installment>>({
    queryKey: ['installment', id?.toString() ?? ''],
    queryFn: () => installmentsApi.getOne(id?.toString() ?? ''),
    enabled: !!id,
  });

  const { data: payments } = useQuery<ApiResponse<Payment[]>>({
    queryKey: ['payments', id?.toString() ?? ''],
    queryFn: () => paymentsApi.getByInstallment(id?.toString() ?? ''),
    enabled: !!id,
  });

  const markPaidMutation = useMutation({
    mutationFn: ({
      paymentId,
      amount,
    }: {
      paymentId: number;
      amount: number;
    }) => paymentsApi.markPaid(paymentId.toString(), amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      queryClient.invalidateQueries({ queryKey: ['installment', id] });
      toast.success('Платеж отмечен как оплаченный');
    },
  });

  const earlyPayoffMutation = useMutation({
    mutationFn: installmentsApi.payOffEarly,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['installment', id] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      setIsEarlyPayoffOpen(false);
      toast.success(
        `Остаток к доплате: ₽${data.remainingAmount.toLocaleString()}`,
      );
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      early_payoff: 'bg-purple-100 text-purple-800',
    };

    const labels = {
      active: 'Активна',
      completed: 'Завершена',
      overdue: 'Просрочка',
      early_payoff: 'Досрочно',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Получение менеджеров для возможного редактирования (если потребуется)
  const { user } = useAuthStore();
  const storeId = user?.storeId;
  const { data: managers } = useQuery({
    queryKey: ['store-managers', storeId],
    queryFn: () => storeId ? adminApi.getStoreUsers(storeId) : Promise.resolve({ data: [] }),
    enabled: !!storeId,
  });

  if (isLoading) {
    return (
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
    );
  }

  if (!installment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Рассрочка не найдена
        </h2>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Вернуться назад
        </Button>
      </div>
    );
  }

  // Остаток по рассрочке
  const remaining =
    payments?.data
      ?.filter((p: Payment) => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Сумма всех оплат по paymentHistory (включая проценты)
  const allPaymentHistory =
    payments?.data?.flatMap((p: Payment) => p.paymentHistory || []) || [];
  const totalPaid = allPaymentHistory.reduce(
    (sum, h) => sum + Number(h.amount),
    0,
  );

  const handlePay = async () => {
    if (!payModal.paymentId || !payAmount) return;
    const amount = Number(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setPayError('Введите корректную сумму');
      return;
    }
    setPayLoading(true);
    setPayError('');
    try {
      await markPaidMutation.mutateAsync({
        paymentId: payModal.paymentId,
        amount,
      });
      setPayModal({ open: false, paymentId: null });
      setPayAmount('');
    } catch (e: unknown) {
      const err = e as ApiError;
      if (err?.errors) {
        setPayError(err.errors.amount[0] || 'Ошибка оплаты');
      } else {
        setPayError('Ошибка оплаты');
      }
    } finally {
      setPayLoading(false);
    }
  };

  // Проверка наличия просроченных платежей
  const hasOverdue = payments?.data?.some(
    (p: Payment) => p.status === 'overdue',
  );

  // Основной долг
  const base =
    Number(installment?.data?.productPrice) -
    Number(installment?.data?.downPayment);
  const months = Number(installment?.data?.months) || 1;
  const principalPerMonth = base / months;
  const paidCount =
    payments?.data?.filter((p: Payment) => p.status === 'paid').length || 0;
  const remainingBase = Math.max(0, base - paidCount * principalPerMonth);

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {installment?.data?.productName}
            </h1>
          </div>
        </div>
        {/* Кнопка досрочного погашения */}
        {installment?.data?.status === 'active' && (
          <>
            <Button
              variant="default"
              className="ml-auto"
              onClick={() => setIsEarlyPayoffOpen(true)}
            >
              Досрочное погашение
            </Button>
            <Dialog
              open={isEarlyPayoffOpen}
              onOpenChange={setIsEarlyPayoffOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Досрочное погашение рассрочки</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {hasOverdue ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Для досрочного погашения сначала оплатите все
                        просроченные платежи.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert>
                        <AlertDescription>
                          При досрочном погашении клиент доплачивает только
                          основную сумму без процентов. Все неоплаченные платежи
                          будут отменены.
                        </AlertDescription>
                      </Alert>
                      {/* Основной долг */}
                      <div className="text-center text-base">
                        Основной долг:{' '}
                        <span className="font-bold text-blue-700">
                          {base.toLocaleString('ru-RU', {
                            maximumFractionDigits: 0,
                          })}{' '}
                          UZS
                        </span>
                      </div>
                      <div className="text-center text-base">
                        Уже оплачено:{' '}
                        <span className="font-bold text-green-700">
                          {totalPaid.toLocaleString('ru-RU', {
                            maximumFractionDigits: 0,
                          })}{' '}
                          UZS
                        </span>
                      </div>
                      <div className="text-center text-base">
                        Остаток основного долга:{' '}
                        <span className="font-bold text-red-700">
                          {remainingBase.toLocaleString('ru-RU', {
                            maximumFractionDigits: 0,
                          })}{' '}
                          UZS
                        </span>
                      </div>
                      {earlyPayoffMutation.isPending ? (
                        <div className="text-center text-gray-500 py-4">
                          Рассчитываем сумму к погашению...
                        </div>
                      ) : earlyPayoffMutation.data &&
                        typeof earlyPayoffMutation.data.remainingAmount ===
                          'number' ? (
                        earlyPayoffMutation.data.remainingAmount > 0 ? (
                          <div className="text-center text-lg font-bold">
                            Сумма к досрочному погашению:{' '}
                            <span className="text-blue-700">
                              {earlyPayoffMutation.data.remainingAmount.toLocaleString(
                                'ru-RU',
                                {
                                  maximumFractionDigits: 0,
                                },
                              )}{' '}
                              UZS
                            </span>
                          </div>
                        ) : (
                          <div className="text-center text-green-600 font-semibold">
                            Вся основная сумма уже оплачена
                          </div>
                        )
                      ) : null}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEarlyPayoffOpen(false)}
                          disabled={earlyPayoffMutation.isPending}
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={() =>
                            earlyPayoffMutation.mutate(
                              installment?.data?.id.toString() ?? '',
                            )
                          }
                          disabled={
                            earlyPayoffMutation.isPending ||
                            (earlyPayoffMutation.data &&
                              earlyPayoffMutation.data.remainingAmount === 0)
                          }
                        >
                          Подтвердить
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="text-xs sm:text-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Клиент</CardTitle>
            <User className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-semibold">
              {installment?.data?.customer.lastName}{' '}
              {installment?.data?.customer.firstName}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {installment?.data?.customer.phone || '-'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              {installment?.data?.customer.address || '-'}
            </div>
            {getStatusBadge(installment?.data?.status ?? '')}
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card className="text-xs sm:text-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Финансы</CardTitle>
            <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Стоимость:</span>
              <span className="font-medium">
                {Number(installment?.data?.productPrice ?? 0).toLocaleString(
                  'ru-RU',
                  { maximumFractionDigits: 0 },
                )}{' '}
                UZS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Первый взнос:</span>
              <span className="font-medium">
                {Number(installment?.data?.downPayment ?? 0).toLocaleString(
                  'ru-RU',
                  { maximumFractionDigits: 0 },
                )}{' '}
                UZS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Процентная ставка:</span>
              <span className="font-medium">
                {Number(installment?.data?.interestRate ?? 0)}%
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Общая сумма:</span>
              <span className="font-bold">
                {(
                  earlyPayoffMutation.data?.newTotalAmount ??
                  installment?.data?.totalAmount ??
                  0
                ).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}{' '}
                UZS
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="text-xs sm:text-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Платежи</CardTitle>
            <CreditCard className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Ежемесячно:</span>
              <span className="font-medium">
                {Number(installment?.data?.monthlyPayment ?? 0).toLocaleString(
                  'ru-RU',
                  { maximumFractionDigits: 0 },
                )}{' '}
                UZS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Срок:</span>
              <span className="font-medium">
                {installment?.data?.months ?? '-'} мес.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Оплачено:</span>
              <span className="font-medium text-green-600">
                {payments?.data?.filter(
                  (p: { status: string }) => p.status === 'paid',
                ).length || 0}{' '}
                из {installment?.data?.months}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm">Создана:</span>
              <span className="font-medium">
                {new Date(
                  installment?.data?.createdAt ?? '',
                ).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* В блоке с деталями рассрочки */}
      <div className="flex flex-col gap-2">
        <div>
          <span className="font-medium">Менеджер: </span>
          {installment?.manager?.fullname || installment?.manager?.login || '-'}
        </div>
      </div>

      {/* Actions */}
      {/* Кнопка досрочного погашения теперь в header, блок ниже можно удалить или оставить только Alert для просрочек */}
      {installment?.data?.status === 'active' && hasOverdue && (
        <Card className="text-xs sm:text-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Действия</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Для досрочного погашения сначала оплатите все просроченные
                платежи.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Остаток по рассрочке */}
      <div className="flex justify-end mb-2">
        <span className="text-base font-semibold">Остаток по рассрочке: </span>
        <span className="ml-2 text-lg font-bold text-blue-700">
          {Number(remaining).toLocaleString('ru-RU', {
            maximumFractionDigits: 0,
          })}{' '}
          UZS
        </span>
      </div>

      {/* Payments Timeline */}
      <Card className="text-xs sm:text-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            График платежей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments?.data?.map((payment: Payment, index: number) => (
              <PaymentTimelineItem
                key={payment.id}
                index={index}
                payment={payment}
                onPay={(paymentId: number) => {
                  setPayModal({ open: true, paymentId });
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Модалка оплаты */}
      <Dialog
        open={payModal.open}
        onOpenChange={(open) => {
          setPayModal({ open, paymentId: open ? payModal.paymentId : null });
          setPayError('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оплата платежа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <InputAmount
              min={1}
              placeholder="Введите сумму оплаты"
              value={payAmount}
              onChange={setPayAmount}
              autoFocus
            />
            {payError && <div className="text-red-600 text-sm">{payError}</div>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPayModal({ open: false, paymentId: null })}
                disabled={payLoading}
              >
                Отмена
              </Button>
              <Button onClick={handlePay} disabled={payLoading}>
                {payLoading ? 'Оплата...' : 'Оплатить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
