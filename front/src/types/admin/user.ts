import type { AdminStore } from "./store";
export interface User {
  id: number;
  login: string;
  role: string;
  storeId: number;
  createdAt: string;
  status: string;
  store: AdminStore | null;
}
