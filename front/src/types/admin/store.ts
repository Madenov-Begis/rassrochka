import type { Installment } from '../store/installments';
import type { AdminUser } from './user';

export interface AdminStore {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  users: number;
}

export interface AdminStoreDetail {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  users: AdminUser[];
  installments: Installment[];
}

export interface TopStore {
  id: number;
  name: string;
  address: string;
  revenue: number;
  installments: number;
}

export interface CustomerDetail {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  passportSeries: string;
  passportNumber: string;
  phone: string;
  additionalPhoneNumber?: string;
  address?: string;
  isBlacklisted: boolean;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentDetail {
  id: number;
  productName: string;
  productPrice: string;
  downPayment: string;
  interestRate: string;
  months: number;
  totalAmount: string;
  monthlyPayment: string;
  status: string; // 'active' | 'completed' | 'overdue' и т.д.
  customerId: number;
  storeId: number;
  createdAt: string;
  updatedAt: string;
  customer: CustomerDetail;
}

export interface PaymentDetail {
  id: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: string; // 'pending' | 'paid' | 'overdue' и т.д.
  installmentId: number;
  createdAt: string;
  updatedAt: string;
  installment: InstallmentDetail;
}
