import type { Installment } from "./installments"

export interface Customer {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  passportSeries: string
  passportNumber: string
  phone: string
  address: string
  isBlacklisted: boolean
  storeId: string
  createdAt: string
  updatedAt: string
  installments: Installment[]
}

export interface CustomerBody {
  firstName: string
  lastName: string
  middleName?: string
  passportSeries: string
  passportNumber: string
  phone: string
  address: string
}

export interface GlobalSearchPassport {
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
  installments: Installment[]
  store: {
      id: number
      name: string
      address: string
      phone: string
      status: string
      createdAt: string
      updatedAt: string
  }
}

export interface CustomerList {
  id: number
  fullname: string
}


 

