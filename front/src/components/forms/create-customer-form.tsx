import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customersApi } from "@/services/api"
import { PatternFormat  } from 'react-number-format';
import type { ApiError, ResponseWithMessage } from "@/types/api-response"
import type { Customer, CustomerBody } from "@/types/store/customers"

interface CreateOrEditCustomerFormProps {
  onSuccess: () => void
  initialValues?: Customer
  editMode?: boolean
}

export function CreateOrEditCustomerForm({ onSuccess,  initialValues, editMode }: CreateOrEditCustomerFormProps) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setError
  } = useForm<CustomerBody>({
    defaultValues: initialValues || {},
  })

  const mutation = useMutation<ResponseWithMessage, ApiError, CustomerBody>({
    mutationFn: (data: CustomerBody) =>
      editMode && initialValues?.id
        ? customersApi.update(initialValues.id as string, data)
        : customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onSuccess()
      reset()
    },
    onError: (error) => {
      const err = error as ApiError
      if (err.errors) {
        Object.entries(err.errors).forEach(([key, value]) => {
          setError(key as keyof CustomerBody, { message: value[0] })
        })
      } 
    }
  })

  const onSubmit = async (data: CustomerBody) => {
    await mutation.mutateAsync(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
      {mutation.error && (
        <Alert variant="destructive">
          <AlertDescription>{ mutation.error.message}</AlertDescription>
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
          <Controller
            name="passportSeries"
            control={control}
            rules={{
              required: "Серия паспорта обязательна",
              pattern: {
                value: /^[A-Z]{2}$/,
                message: "Серия паспорта: 2 латинские заглавные буквы",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                maxLength={2}
                onChange={e => field.onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))}
                placeholder="AA"
              />
            )}
          />
          {errors.passportSeries && <p className="text-sm text-red-600">{errors.passportSeries.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportNumber">Номер паспорта *</Label>
          <div className="flex gap-2">
            <Controller
              name="passportNumber"
              control={control}
              rules={{
                required: "Номер паспорта обязателен",
                pattern: {
                  value: /^[0-9]{7}$/,
                  message: "Номер паспорта: только 7 цифр",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 7))}
                  placeholder="1234567"
                />
              )}
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
            // pattern: {
            //   value: /^\+998\d{9}$/,
            //   message: "Телефон должен быть в формате +998XXXXXXXXX",
            // },
          }}
          render={({ field }) => (
            <PatternFormat 
              {...field}
              format="+998#########"
              allowEmptyFormatting={true}
              mask=" "
              placeholder="+998901234567"
              customInput={Input}
              disabled={mutation.isPending}
              onValueChange={values => field.onChange(values.value ? `+998${values.value}` : '')}
            />
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
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editMode ? "Сохранить" : "Создать клиента"}
        </Button>
      </div>
    </form>
  )
}
