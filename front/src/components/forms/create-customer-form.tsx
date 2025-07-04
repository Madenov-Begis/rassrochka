import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customersApi } from "@/services/api"
import InputMask from "react-input-mask"

interface CreateCustomerFormProps {
  onSuccess: () => void
}

export function CreateCustomerForm({ onSuccess }: CreateCustomerFormProps) {
  const [passportCheck, setPassportCheck] = useState<any>(null)
  const [isCheckingPassport, setIsCheckingPassport] = useState(false)

  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const passportSeries = watch("passportSeries")
  const passportNumber = watch("passportNumber")

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onSuccess()
    },
  })

  const checkPassport = async () => {
    if (!passportSeries || !passportNumber) return

    setIsCheckingPassport(true)
    try {
      const result = await customersApi.searchByPassport(`${passportSeries} ${passportNumber}`)
      setPassportCheck(result)
    } catch (error) {
      console.error("Error checking passport:", error)
    } finally {
      setIsCheckingPassport(false)
    }
  }

  const onSubmit = (data: any) => {
    createMutation.mutate(data)
  }

  const getPassportStatusIcon = () => {
    if (!passportCheck) return null

    switch (passportCheck.status) {
      case "clean":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "blacklisted":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getPassportStatusColor = () => {
    if (!passportCheck) return ""

    switch (passportCheck.status) {
      case "clean":
        return "border-green-500 bg-green-50"
      case "overdue":
        return "border-yellow-500 bg-yellow-50"
      case "blacklisted":
        return "border-red-500 bg-red-50"
      default:
        return ""
    }
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
            {...register("passportSeries", { required: "Серия паспорта обязательна" })}
            placeholder="4509"
            maxLength={4}
          />
          {errors.passportSeries && <p className="text-sm text-red-600">{errors.passportSeries.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportNumber">Номер паспорта *</Label>
          <div className="flex gap-2">
            <Input
              id="passportNumber"
              {...register("passportNumber", { required: "Номер паспорта обязателен" })}
              placeholder="123456"
              maxLength={6}
              className={getPassportStatusColor()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={checkPassport}
              disabled={isCheckingPassport || !passportSeries || !passportNumber}
            >
              {isCheckingPassport ? <Loader2 className="h-4 w-4 animate-spin" /> : "Проверить"}
            </Button>
          </div>
          {errors.passportNumber && <p className="text-sm text-red-600">{errors.passportNumber.message as string}</p>}
        </div>
      </div>

      {passportCheck && (
        <Alert className={`flex items-center gap-2 ${getPassportStatusColor()}`}>
          {getPassportStatusIcon()}
          <AlertDescription>{passportCheck.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон (Узбекистан) *</Label>
        <InputMask
          mask="+998 (99) 999-99-99"
          value={watch('phone')}
          onChange={e => setValue('phone', e.target.value)}
          disabled={createMutation.isPending}
        >
          {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
            <Input
              id="phone"
              {...inputProps}
              {...register("phone", {
                required: "Телефон обязателен",
                pattern: {
                  value: /^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/,
                  message: "Телефон в формате +998 (90) 123-45-67",
                },
              })}
              placeholder="+998 (90) 123-45-67"
            />
          )}
        </InputMask>
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
        <Button type="submit" disabled={createMutation.isPending || passportCheck?.status === "blacklisted"}>
          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Создать клиента
        </Button>
      </div>
    </form>
  )
}
