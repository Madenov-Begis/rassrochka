import { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/services/api';

export default function PaymentsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: upcomingPayments } = useQuery({
    queryKey: ['payments', 'upcoming'],
    queryFn: () => paymentsApi.getUpcoming(),
  });

  const { data: overduePayments } = useQuery({
    queryKey: ['payments', 'overdue'],
    queryFn: () => paymentsApi.getOverdue(),
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPaymentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return upcomingPayments?.data?.filter((payment: any) => {
      const paymentDate = new Date(payment.dueDate).toISOString().split('T')[0];
      return paymentDate === dateStr;
    });
  };

  const renderCalendarDay = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const payments = getPaymentsForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <div
        key={day}
        className={`min-h-[80px] p-2 border border-gray-200 ${
          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
        } hover:bg-gray-50 transition-colors`}
      >
        <div
          className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}
        >
          {day}
        </div>
        <div className="space-y-1">
          {payments?.slice(0, 2).map((payment: any) => (
            <div
              key={payment.id}
              className="text-xs p-1 bg-yellow-100 text-yellow-800 rounded truncate"
              title={`${payment.installment.customer.firstName} ${
                payment.installment.customer.lastName
              } - ${Number(payment.amount).toLocaleString('ru-RU', {
                maximumFractionDigits: 0,
              })} UZS`}
            >
              {Number(payment.amount).toLocaleString('ru-RU', {
                maximumFractionDigits: 0,
              })}
            </div>
          ))}
          {payments && payments.length > 2 && (
            <div className="text-xs text-gray-500">
              +{payments.length - 2} еще
            </div>
          )}
        </div>
      </div>
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Календарь платежей</h1>
          <p className="text-gray-600">
            Визуализация предстоящих и просроченных платежей
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Предстоящие платежи
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingPayments?.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">На следующие 7 дней</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просрочки</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overduePayments?.data?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground text-red-600">
              Требует внимания
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Сумма на неделю
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingPayments?.data
                ?.reduce(
                  (sum: number, payment: any) => sum + Number(payment.amount),
                  0,
                )
                .toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ожидаемые поступления
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Header days */}
            {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
              <div
                key={day}
                className="p-3 bg-gray-50 border-b border-gray-200 text-center font-medium text-sm"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-[80px] bg-gray-50 border-b border-gray-200"
              ></div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }, (_, index) =>
              renderCalendarDay(index + 1),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments */}
      {overduePayments?.data && overduePayments?.data?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Просроченные платежи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overduePayments?.data?.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {payment.installment.customer.firstName}{' '}
                      {payment.installment.customer.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {payment.installment.customer.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {Number(payment.amount).toLocaleString('ru-RU', {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-sm text-red-500">
                      Просрочка:{' '}
                      {Math.ceil(
                        (Date.now() - new Date(payment.dueDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{' '}
                      дн.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
