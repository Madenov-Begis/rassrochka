/**
 * @file: import.service.ts
 * @description: Сервис для импорта клиентов и рассрочек из Excel файлов
 * @dependencies: PrismaService, exceljs
 * @created: 2024-07-16
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentStatus } from '@prisma/client';

// Типы для multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface ImportResult {
  total: number;
  success: number;
  errors: Array<{
    row: number;
    errors: string[];
  }>;
}

interface ClientRow {
  firstName: string;
  lastName: string;
  middleName?: string;
  passportSeries: string;
  passportNumber: string;
  phone: string;
  address: string;
}

interface InstallmentRow {
  customerFirstName: string;
  customerLastName: string;
  customerMiddleName?: string;
  passportSeries: string;
  passportNumber: string;
  productName: string;
  productPrice: number;
  downPayment: number;
  interestRate: number;
  months: number;
  createdAt: string;
}

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) { }

  async importClients(file: MulterFile, storeId: number): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Файл не содержит данных');
    }

    const result: ImportResult = {
      total: 0,
      success: 0,
      errors: []
    };

    // Пропускаем заголовок
    const rows = worksheet.getRows(2, worksheet.rowCount - 1) || [];
    result.total = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.values.length == 0) {
        continue;
      }
      const rowNumber = i + 2; // +2 потому что начинаем со 2-й строки (после заголовка)

      try {
        const clientData = this.parseClientRow(row);
        await this.validateClientData(clientData, storeId);
        await this.createClient(clientData, storeId);
        result.success++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          errors: Array.isArray(error.message) ? error.message : [error.message]
        });
      }
    }

    return result;
  }

  async importInstallments(file: MulterFile, storeId: number): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Файл не содержит данных');
    }

    const result: ImportResult = {
      total: 0,
      success: 0,
      errors: []
    };

    // Пропускаем заголовок
    const rows = worksheet.getRows(2, worksheet.rowCount - 1) || [];
    result.total = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.values.length == 0) {
        continue;
      }
      const rowNumber = i + 2;

      try {
        const installmentData = this.parseInstallmentRow(row);
        await this.validateInstallmentData(installmentData, storeId);
        await this.createInstallment(installmentData, storeId);
        result.success++;
      } catch (error) {
        console.log(error)
        result.errors.push({
          row: rowNumber,
          errors: Array.isArray(error.message) ? error.message : [error.message]
        });
      }
    }

    return result;
  }

  private parseClientRow(row: ExcelJS.Row): ClientRow {
    const cells = row.values as any[];

    return {
      firstName: this.getStringValue(cells[1]),
      lastName: this.getStringValue(cells[2]),
      middleName: this.getStringValue(cells[3]) || undefined,
      passportSeries: this.getStringValue(cells[4]),
      passportNumber: this.getStringValue(cells[5]),
      phone: this.getStringValue(cells[6]),
      address: this.getStringValue(cells[7]),
    };
  }

  private getStringValue(value: any): string {
    if (value === null || value === undefined) {
      throw new Error('Поле обязательно для заполнения');
    }
    const str = String(value).trim();
    if (!str) {
      throw new Error('Поле не может быть пустым');
    }
    return str;
  }

  private getNumberValue(value: any): number {
    if (value === null || value === undefined) {
      throw new Error('Поле обязательно для заполнения');
    }
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      throw new Error('Значение должно быть положительным числом');
    }
    return num;
  }

  private getDateValue(value: any): Date {
    if (value === null || value === undefined) {
      throw new Error('Поле обязательно для заполнения');
    }

    // If the value is already a Date object
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        throw new Error('Некорректная дата');
      }
      return value;
    }

    // If it's an Excel serial number
    if (typeof value === 'number') {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (isNaN(date.getTime())) {
        throw new Error('Некорректная дата');
      }
      return date;
    }

    // If it's a string, try parsing it
    const str = String(value).trim();
    if (!str) {
      throw new Error('Дата не может быть пустой');
    }

    // Try parsing as ISO string or various date formats
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      // Try parsing DD.MM.YYYY format
      const parts = str.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
      throw new Error('Некорректный формат даты. Используйте формат DD.MM.YYYY или ISO');
    }
    return date;
  }

  private parseInstallmentRow(row: ExcelJS.Row): InstallmentRow {
    const cells = row.values as any[];

    return {
      customerFirstName: this.getStringValue(cells[1]),
      customerLastName: this.getStringValue(cells[2]),
      customerMiddleName: this.getStringValue(cells[3]) || undefined,
      passportSeries: this.getStringValue(cells[4]),
      passportNumber: this.getStringValue(cells[5]),
      productName: this.getStringValue(cells[6]),
      productPrice: this.getNumberValue(cells[7]),
      downPayment: this.getNumberValue(cells[8]),
      interestRate: this.getNumberValue(cells[9]),
      months: this.getNumberValue(cells[10]),
      createdAt: this.getDateValue(cells[11]).toISOString()
    };
  }

  private async validateClientData(data: ClientRow, storeId: number): Promise<void> {
    const errors: string[] = [];

    // Проверка обязательных полей
    if (!data.firstName) errors.push('Имя обязательно');
    if (!data.lastName) errors.push('Фамилия обязательна');
    if (!data.passportSeries) errors.push('Серия паспорта обязательна');
    if (!data.passportNumber) errors.push('Номер паспорта обязателен');
    if (!data.phone) errors.push('Телефон обязателен');
    if (!data.address) errors.push('Адрес обязателен');

    // Проверка формата телефона
    const phoneRegex = /^\+998\d{9}$/;
    if (data.phone && data.phone.trim() !== '' && !phoneRegex.test(data.phone)) {
      errors.push('Неверный формат телефона (должен быть +998XXXXXXXXX)');
    }

    // Проверка уникальности паспорта
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        passportSeries_passportNumber: {
          passportSeries: data.passportSeries,
          passportNumber: data.passportNumber
        }
      }
    });

    if (existingCustomer) {
      errors.push('Клиент с таким паспортом уже существует');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  private async validateInstallmentData(data: InstallmentRow, storeId: number): Promise<void> {
    const errors: string[] = [];

    // Проверка обязательных полей
    if (!data.customerFirstName) errors.push('Имя клиента обязательно');
    if (!data.customerLastName) errors.push('Фамилия клиента обязательна');
    if (!data.passportSeries) errors.push('Серия паспорта обязательна');
    if (!data.passportNumber) errors.push('Номер паспорта обязателен');
    if (!data.productName) errors.push('Название товара обязательно');
    if (data.productPrice <= 0) errors.push('Цена товара должна быть больше 0');
    if (data.downPayment < 0) errors.push('Первоначальный взнос не может быть отрицательным');
    if (data.interestRate < 0) errors.push('Процентная ставка не может быть отрицательной');
    if (data.months <= 0) errors.push('Срок должен быть больше 0');
    if (!data.createdAt) errors.push('Дата создания обязательна');

    // Проверка логики
    if (data.downPayment >= data.productPrice) {
      errors.push('Первоначальный взнос не может быть больше или равен цене товара');
    }

    // Поиск клиента
    const customer = await this.prisma.customer.findUnique({
      where: {
        passportSeries_passportNumber: {
          passportSeries: data.passportSeries,
          passportNumber: data.passportNumber
        }
      }
    });

    if (!customer) {
      errors.push('Клиент с таким паспортом не найден');
    } else if (customer.storeId !== storeId) {
      errors.push('Клиент принадлежит другому магазину');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  private async createClient(data: ClientRow, storeId: number): Promise<void> {
    await this.prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        passportSeries: data.passportSeries,
        passportNumber: data.passportNumber,
        phone: data.phone,
        address: data.address,
        storeId: storeId,
        isBlacklisted: false
      }
    });
  }

  private async createInstallment(data: InstallmentRow, storeId: number): Promise<void> {
    // Находим клиента
    const customer = await this.prisma.customer.findUnique({
      where: {
        passportSeries_passportNumber: {
          passportSeries: data.passportSeries,
          passportNumber: data.passportNumber
        }
      }
    });

    if (!customer) {
      throw new Error('Клиент не найден');
    }

    // Рассчитываем параметры рассрочки
    const base = data.productPrice - data.downPayment;
    const totalAmount = base * (1 + data.interestRate / 100);
    const monthlyPayment = totalAmount / data.months;

    // Создаем рассрочку
    const installment = await this.prisma.installment.create({
      data: {
        productName: data.productName,
        productPrice: new Decimal(data.productPrice),
        downPayment: new Decimal(data.downPayment),
        interestRate: new Decimal(data.interestRate),
        months: data.months,
        totalAmount: new Decimal(totalAmount),
        monthlyPayment: new Decimal(monthlyPayment),
        status: 'active',
        customerId: customer.id,
        storeId: storeId,
        createdAt: new Date(data.createdAt)
      }
    });

    // Создаем график платежей
    const payments: Array<{
      amount: Decimal;
      dueDate: Date;
      status: PaymentStatus;
      installmentId: number;
    }> = [];
    const today = new Date(data.createdAt)

    for (let i = 1; i <= data.months; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);

      let status;
      const currentDate = new Date()

      if (dueDate < currentDate) {
        status = PaymentStatus.overdue
      } else {
        status = PaymentStatus.pending
      }

      payments.push({
        amount: new Decimal(monthlyPayment),
        dueDate: dueDate,
        status,
        installmentId: installment.id
      });
    }

    await this.prisma.payment.createMany({
      data: payments
    });
  }
} 