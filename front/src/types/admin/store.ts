import type { Installment } from "../store/installments";
import type { User } from "./user";

export interface AdminStore {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
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
  users: User[];
  installments: Installment[];
}

export interface TopStore {
  id: number;
  name: string;
  address: string;
  revenue: number;
  installments: number;
}
