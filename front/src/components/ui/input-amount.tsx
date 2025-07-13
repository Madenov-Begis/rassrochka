/**
 * @file: input-amount.tsx
 * @description: Инпут для суммы/цены с автодобавлением разделителей тысяч (обёртка над shadcn/ui Input)
 * @dependencies: React, Input (shadcn/ui)
 * @created: 2024-07-11
 */
import * as React from "react"
import { Input } from "@/components/ui/input"

interface InputAmountProps extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: string | number
  onChange: (value: string) => void
}

export const InputAmount = React.forwardRef<HTMLInputElement, InputAmountProps>(
  ({ value, onChange, ...props }, ref) => {
    // Форматирует число с разделителями тысяч
    const format = (val: string | number) => {
      const num = String(val).replace(/\D/g, "")
      if (!num) return ""
      return Number(num).toLocaleString("ru-RU")
    }

    // Убирает все нецифры
    const unformat = (val: string) => val.replace(/\D/g, "")

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={format(value)}
        onChange={e => {
          onChange(unformat(e.target.value))
        }}
        autoComplete="off"
      />
    )
  }
)
InputAmount.displayName = "InputAmount" 