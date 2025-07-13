import { useNavigate } from "react-router-dom"
import { CreateInstallmentForm } from "@/components/forms/create-installment-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"

export default function CreateInstallmentPage() {
  const navigate = useNavigate()
  return (
    <DashboardLayout>
      <div className="py-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Оформление рассрочки</h1>
          <Button variant="outline" onClick={() => navigate("/store/installments")}>Назад</Button>
        </div>
        <p className="text-gray-600 mb-4">Заполните все поля для расчёта и оформления рассрочки. <b>Процентная ставка указывается в месяц</b>. Итоговый расчёт появится после заполнения всех полей.</p>
            <CreateInstallmentForm onSuccess={() => navigate("/store/installments")} />
      </div>
    </DashboardLayout>
  )
} 