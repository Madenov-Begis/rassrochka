export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  users: number;
}

export interface TopStore {
  id: number;
  name: string;
  address: string;
  revenue: number;
  installments: number;
}
