/**
 * @file: PaymentTimelineItem.tsx
 * @description: Элемент вертикального timeline для графика платежей с историей оплат
 * @dependencies: React, Badge, Separator, clsx
 * @created: 2024-07-11
 */
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { Payment, PaymentHistory } from "@/types/store/payments"

interface PaymentTimelineItemProps {
  payment: Payment
  index: number
  onPay?: (paymentId: number) => void
  payLoading?: boolean
}

export const PaymentTimelineItem: React.FC<PaymentTimelineItemProps> = ({ payment, index, onPay, payLoading }) => {
  const paidSum = payment.paymentHistory?.reduce((sum, h) => sum + Number(h.amount), 0) || 0
  let statusLabel = <Badge>{payment.status === "paid" ? "Оплачен" : payment.status === "overdue" ? "Просрочен" : payment.status === "pending" ? "Ожидает" : payment.status}</Badge>
  let statusColor = "bg-gray-200 text-gray-700"
  if (payment.status === "paid") statusColor = "bg-green-100 text-green-700"
  if (payment.status === "overdue") statusColor = "bg-red-100 text-red-700"
  if (payment.status === "pending" && paidSum > 0 && paidSum < Number(payment.amount)) {
    statusLabel = <Badge className="bg-yellow-200 text-yellow-800">Частично</Badge>
    statusColor = "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="relative flex gap-4 min-h-[80px]">
      {/* Timeline line & dot */}
      <div className="flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full border-2 ${statusColor} flex items-center justify-center font-bold text-xs`}>{index + 1}</div>
        <div className="flex-1 w-px bg-gray-200" style={{ minHeight: 40 }} />
      </div>
      {/* Card */}
      <div className="flex-1 bg-white rounded-lg border shadow-sm px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="font-semibold text-sm md:w-28">{payment.dueDate ? new Date(String(payment.dueDate)).toLocaleDateString() : '-'}</div>
          <div className="text-base font-bold md:w-32">{Number(payment.amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</div>
          <div className="md:w-28">{statusLabel}</div>
          <div className="flex-1" />
          {(payment.status === "pending" || payment.status === "overdue" || (payment.status === "pending" && paidSum < Number(payment.amount))) && onPay && (
            <Button size="sm" onClick={() => onPay(payment.id)} disabled={payLoading}>Оплатить</Button>
          )}
        </div>
        {paidSum > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">История оплат:</span>
            <ul className="mt-1 space-y-0.5">
              {payment.paymentHistory?.map((h: PaymentHistory) => (
                <li key={h.id} className="flex items-center gap-1 text-xs text-gray-500">
                  <span>+{Number(h.amount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS</span>
                  <span className="ml-1">{new Date(String(h.paidDate)).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
            {/* Остаток по месяцу при частичном статусе */}
            {payment.status === "pending" && paidSum > 0 && paidSum < Number(payment.amount) && (
              <div className="mt-1 text-orange-600 font-semibold">
                Остаток по месяцу: {(Number(payment.amount) - paidSum).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} UZS
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 