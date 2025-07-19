import type { AdminStore } from "./store";
export interface AdminUser {
  id: number;
  login: string;
  role: 'admin' | 'store_manager';
  storeId: number;
  createdAt: string;
  status: 'active' | 'inactive' | 'blocked';
  store: AdminStore | null;
}

export interface UserBody {
  login: string
  role: "admin" | "store_manager",
  status?: "active"| "blocked"| "inactive"
  storeId?: string | null,
  password?: string | undefined,
}
