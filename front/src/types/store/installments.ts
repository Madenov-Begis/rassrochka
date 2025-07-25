export interface Installment {
  id: number;
  customerId: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  monthlyPayment: number;
  productName: string;
  productPrice?: number;
  downPayment?: number;
  interestRate?: number;
  months?: number;
  customer: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  };
  managerId?: number;
  manager?: {
    id: number;
    login: string;
    fullname?: string;
  };
}

export interface InstallmentBody {
  productName: string;
  productPrice: number;
  downPayment: number;
  interestRate: number;
  months: number;
  customerId: number;
  managerId: number;
}

export interface Payment {
  id: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  installmentId: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreManager {
  id: number;
  login: string;
}
