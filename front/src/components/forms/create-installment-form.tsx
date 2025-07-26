import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { installmentsApi, customersApi } from '@/services/api';
import type { CustomerList } from '@/types/store/customers';
import type { ApiResponse, ApiError } from '@/types/api-response';
import type { InstallmentBody } from '@/types/store/installments';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputAmount } from '@/components/ui/input-amount';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/services/api';

interface CreateInstallmentFormProps {
  onSuccess: () => void;
}

export function CreateInstallmentForm({
  onSuccess,
}: CreateInstallmentFormProps) {
  const [calculation, setCalculation] = useState<{
    base: number;
    totalAmount: number;
    monthlyPayment: number;
    totalInterest: number;
  } | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const queryClient = useQueryClient();

  const installmentSchema = z
    .object({
      productName: z.string().min(1, 'Название товара обязательно'),
      productPrice: z.number().min(1, 'Стоимость должна быть больше 0'),
      downPayment: z.number().min(0, 'Взнос не может быть отрицательным'),
      interestRate: z
        .number()
        .min(0, 'Ставка не может быть отрицательной')
        .max(100, 'Ставка не может быть больше 100%'),
      months: z
        .number()
        .min(1, 'Срок должен быть не менее 1 месяца')
        .max(120, 'Срок не может превышать 120 месяцев'),
      customerId: z.number(),
      managerId: z.number().optional(),
    })
    .refine((data) => data.productPrice > data.downPayment, {
      message: 'Стоимость товара должна быть больше первоначального взноса',
      path: ['productPrice'],
    });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    getValues,
    reset,
  } = useForm<InstallmentBody>({
    mode: 'onTouched',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      productName: '',
      productPrice: undefined,
      downPayment: undefined,
      interestRate: undefined,
      months: undefined,
      customerId: undefined,
      managerId: undefined,
    },
  });

  const { user } = useAuthStore();
  const storeId = user?.storeId;
  const { data: managers } = useQuery({
    queryKey: ['store-managers', storeId],
    queryFn: () => storeId ? adminApi.getStoreUsers(storeId) : Promise.resolve({ data: [] }),
    enabled: !!storeId,
  });

  const { data: customers } = useQuery<ApiResponse<CustomerList[]>, ApiError>({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: installmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      onSuccess();
    },
  });

  const handleCalculate = async () => {
    setShowCalculation(true);
    const valid = await trigger();
    if (valid) {
      const values = getValues();
      if (
        typeof values.productPrice === 'number' &&
        !isNaN(values.productPrice) &&
        typeof values.downPayment === 'number' &&
        !isNaN(values.downPayment) &&
        typeof values.interestRate === 'number' &&
        !isNaN(values.interestRate) &&
        typeof values.months === 'number' &&
        !isNaN(values.months)
      ) {
        const base = values.productPrice - values.downPayment;
        const totalInterest =
          (base * values.interestRate * values.months) / 100;
        const totalAmount = base + totalInterest;
        const monthlyPayment = totalAmount / values.months;
        setCalculation({
          base,
          totalAmount,
          monthlyPayment,
          totalInterest,
        });
      } else {
        setCalculation(null);
      }
    } else {
      setShowCalculation(false);
    }
  };

  const onSubmit = (data: InstallmentBody) => {
    createMutation.mutate(
      {
        ...data,
        productPrice: Number(data.productPrice),
        downPayment: Number(data.downPayment),
        interestRate: Number(data.interestRate),
        months: Number(data.months),
        customerId: data.customerId.toString(),
        managerId: data.managerId,
      },
      {
        onSuccess: () => {
          reset();
          setCalculation(null);
          setShowCalculation(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Левая колонка: форма */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl md:text-3xl">
            Данные для оформления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4 text-xs sm:text-sm"
          >
            {createMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createMutation.error.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="customerId">Клиент *</Label>
              <Select
                onValueChange={(value) => setValue('customerId', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.data?.map((customer: CustomerList) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.id.toString()}
                    >
                      {customer.fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-600">
                  {errors.customerId.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Название товара *</Label>
              <Input
                id="productName"
                {...register('productName')}
                placeholder="Введите название товара"
              />
              {errors.productName && (
                <p className="text-sm text-red-600">
                  {errors.productName.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Стоимость товара (UZS) *</Label>
              <InputAmount
                id="productPrice"
                value={getValues('productPrice') || ''}
                onChange={(val) => {
                  setValue('productPrice', val ? Number(val) : 0, {
                    shouldValidate: true,
                  });
                }}
                placeholder="Введите стоимость товара"
              />
              {errors.productPrice && (
                <p className="text-sm text-red-600">
                  {errors.productPrice.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">Первоначальный взнос (UZS) *</Label>
              <InputAmount
                id="downPayment"
                value={getValues('downPayment') ?? ''}
                onChange={(val) =>
                  setValue('downPayment', val ? Number(val) : 0, {
                    shouldValidate: true,
                  })
                }
                placeholder="Введите первоначальный взнос"
              />
              {errors.downPayment && (
                <p className="text-sm text-red-600">
                  {errors.downPayment.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">
                Процентная ставка в месяц (%) *
              </Label>
              <Input
                id="interestRate"
                type="number"
                {...register('interestRate', { valueAsNumber: true })}
                placeholder="Введите процентную ставку в месяц"
              />
              {errors.interestRate && (
                <p className="text-sm text-red-600">
                  {errors.interestRate.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="months">Срок (месяцев) *</Label>
              <Input
                id="months"
                type="number"
                {...register('months', { valueAsNumber: true })}
                placeholder="Введите срок в месяцах"
              />
              {errors.months && (
                <p className="text-sm text-red-600">
                  {errors.months.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerId">Менеджер *</Label>
              <Select
                onValueChange={(value) => setValue('managerId', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                  {managers?.data?.filter((m: any) => m.role === 'store_manager').map((manager: any) => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>
                      {manager.fullname || manager.login}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.managerId && (
                <p className="text-sm text-red-600">{errors.managerId.message as string}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleCalculate}
                disabled={createMutation.isPending}
              >
                Рассчитать
              </Button>
            </div>
            {showCalculation && calculation && (
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Оформить рассрочку
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      {/* Правая колонка: расчет */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl md:text-3xl">
            Расчет рассрочки
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCalculation && calculation ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Сумма к рассрочке:</span>
                <span className="font-medium">
                  {calculation.base.toLocaleString()} UZS
                </span>
              </div>
              <div className="flex justify-between">
                <span>Переплата:</span>
                <span className="font-medium text-orange-600">
                  {calculation.totalInterest.toLocaleString()} UZS
                </span>
              </div>
              <div className="flex justify-between">
                <span>Общая сумма:</span>
                <span className="font-medium">
                  {calculation.totalAmount.toLocaleString()} UZS
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Ежемесячный платеж:</span>
                <span className="text-blue-600">
                  {calculation.monthlyPayment.toLocaleString()} UZS
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center pt-12">
              Заполните форму и нажмите "Рассчитать"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
