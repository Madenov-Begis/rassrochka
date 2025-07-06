import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customersApi } from "@/services/api"
import InputMask from "react-input-mask"
interface CreateCustomerFormProps {
  onSuccess: () => void
}

export function CreateCustomerForm({ onSuccess }: CreateCustomerFormProps) {
  
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm()

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onSuccess()
    },
  })

  const onSubmit = (data: Record<string, unknown>) => {
    createMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {createMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>Ошибка при создании клиента. Проверьте данные и попробуйте снова.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия *</Label>
          <Input id="lastName" {...register("lastName", { required: "Фамилия обязательна" })} placeholder="Иванов" />
          {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">Имя *</Label>
          <Input id="firstName" {...register("firstName", { required: "Имя обязательно" })} placeholder="Иван" />
          {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input id="middleName" {...register("middleName")} placeholder="Иванович" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passportSeries">Серия паспорта *</Label>
          <Input
            id="passportSeries"
            {...register("passportSeries", {
              required: "Серия паспорта обязательна",
              pattern: {
                value: /^[A-Z]{2}$/i,
                message: "Серия паспорта: 2 латинские буквы",
              },
            })}
            placeholder="AA"
            maxLength={2}
          />
          {errors.passportSeries && <p className="text-sm text-red-600">{errors.passportSeries.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportNumber">Номер паспорта *</Label>
          <div className="flex gap-2">
            <Input
              id="passportNumber"
              {...register("passportNumber", {
                required: "Номер паспорта обязателен",
                pattern: {
                  value: /^\d{7}$/,
                  message: "Номер паспорта: 7 цифр",
                },
              })}
              placeholder="1234567"
              maxLength={7}
            />
          </div>
          {errors.passportNumber && <p className="text-sm text-red-600">{errors.passportNumber.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон (Узбекистан) *</Label>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: "Телефон обязателен",
            pattern: {
              value: /^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/,
              message: "Телефон в формате +998 (90) 123-45-67",
            },
          }}
          render={({ field }) => (
            <InputMask
              mask="+998 (99) 999-99-99"
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={createMutation.isPending}
            >
              {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                <Input
                  id="phone"
                  {...inputProps}
                  placeholder="+998 (90) 123-45-67"
                />
              )}
            </InputMask>
          )}
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Адрес *</Label>
        <Input
          id="address"
          {...register("address", { required: "Адрес обязателен" })}
          placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
        />
        {errors.address && <p className="text-sm text-red-600">{errors.address.message as string}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Отмена
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Создать клиента
        </Button>
      </div>
    </form>
  )
}
