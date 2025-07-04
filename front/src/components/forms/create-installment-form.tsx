import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { installmentsApi, customersApi } from "@/services/api"

interface CreateInstallmentFormProps {
  onSuccess: () => void
}

export function CreateInstallmentForm({ onSuccess }: CreateInstallmentFormProps) {
  const [calculation, setCalculation] = useState<any>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersApi.getAll({}),
  })

  const createMutation = useMutation({
    mutationFn: installmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] })
      onSuccess()
    },
  })

  const productPrice = watch("productPrice")
  const downPayment = watch("downPayment")
  const interestRate = watch("interestRate")
  const months = watch("months")

  useEffect(() => {
    if (productPrice && downPayment && interestRate && months) {
      const base = Number(productPrice) - Number(downPayment)
      const totalAmount = base * (1 + Number(interestRate) / 100)
      const monthlyPayment = totalAmount / Number(months)

      setCalculation({
        base,
        totalAmount,
        monthlyPayment,
        totalInterest: totalAmount - base,
      })
    } else {
      setCalculation(null)
    }
  }, [productPrice, downPayment, interestRate, months])

  const onSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      productPrice: Number(data.productPrice),
      downPayment: Number(data.downPayment),
      interestRate: Number(data.interestRate),
      months: Number(data.months),
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {createMutation.error && (
          <Alert variant="destructive">
            <AlertDescription>Ошибка при создании рассрочки. Проверьте данные и попробуйте снова.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Клиент *</Label>
            <Select onValueChange={(value) => setValue("customerId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {customers?.data?.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.lastName} {customer.firstName} ({customer.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && <p className="text-sm text-red-600">{errors.customerId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Название товара *</Label>
            <Input
              id="productName"
              {...register("productName", { required: "Название товара обязательно" })}
              placeholder="iPhone 15 Pro"
            />
            {errors.productName && <p className="text-sm text-red-600">{errors.productName.message as string}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productPrice">Стоимость товара (₽) *</Label>
            <Input
              id="productPrice"
              type="number"
              {...register("productPrice", {
                required: "Стоимость товара обязательна",
                min: { value: 1, message: "Стоимость должна быть больше 0" },
              })}
              placeholder="1000000"
            />
            {errors.productPrice && <p className="text-sm text-red-600">{errors.productPrice.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPayment">Первоначальный взнос (₽) *</Label>
            <Input
              id="downPayment"
              type="number"
              {...register("downPayment", {
                required: "Первоначальный взнос обязателен",
                min: { value: 0, message: "Взнос не может быть отрицательным" },
              })}
              placeholder="200000"
            />
            {errors.downPayment && <p className="text-sm text-red-600">{errors.downPayment.message as string}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interestRate">Процентная ставка (%) *</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              {...register("interestRate", {
                required: "Процентная ставка обязательна",
                min: { value: 0, message: "Ставка не может быть отрицательной" },
                max: { value: 100, message: "Ставка не может быть больше 100%" },
              })}
              placeholder="15.0"
            />
            {errors.interestRate && <p className="text-sm text-red-600">{errors.interestRate.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="months">Срок (месяцев) *</Label>
            <Select onValueChange={(value) => setValue("months", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите срок" />
              </SelectTrigger>
              <SelectContent>
                {[6, 12, 18, 24, 36, 48].map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {month} месяцев
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.months && <p className="text-sm text-red-600">{errors.months.message as string}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Отмена
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !calculation}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Создать рассрочку
          </Button>
        </div>
      </form>

      {/* Calculation Preview */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Расчет рассрочки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Сумма к рассрочке:</span>
              <span className="font-medium">₽{calculation.base.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Переплата:</span>
              <span className="font-medium text-orange-600">₽{calculation.totalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Общая сумма:</span>
              <span className="font-medium">₽{calculation.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Ежемесячный платеж:</span>
              <span className="text-blue-600">₽{calculation.monthlyPayment.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
