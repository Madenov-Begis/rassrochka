export interface PaymentHistory {
  id: number
  paymentId: number
  amount: number
  paidDate: string
}

export interface Payment {
  id: number
  installmentId: number
  amount: number
  status: string
  dueDate: string
  paidDate: string | null
  createdAt: string
  updatedAt: string
  paymentHistory?: PaymentHistory[]
  installment: {
    id: number
    productName: string
    productPrice: number
    downPayment: number
    interestRate: number
    months: number
    totalAmount: number
    monthlyPayment: number
    status: string
    customerId: number
    storeId: number
    createdAt: string
    updatedAt: string
    customer: {
      id: number
      firstName: string
      lastName: string
      middleName?: string
      passportSeries: string
      passportNumber: string
      phone: string
      address: string
      isBlacklisted: boolean
      storeId: number
      createdAt: string
      updatedAt: string
    }
  }
}
