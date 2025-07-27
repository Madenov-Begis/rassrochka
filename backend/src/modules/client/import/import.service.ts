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
  additionalPhoneNumber: string;
  address?: string;
}

interface InstallmentRow {
  customerFirstName: string;
  customerLastName: string;
  customerMiddleName?: string;
  passportSeries: string;
  passportNumber: string;
  customerPhone: string;
  customerAdditionalPhoneNumber: string;
  customerAddress?: string;
  productName: string;
  productPrice: number;
  downPayment: number;
  interestRate: number;
  months: number;
  createdAt: string;
  managerLogin: string;
}

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importClients(
    file: MulterFile,
    storeId: number,
  ): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Файл не содержит данных');
    }

    const result: ImportResult = {
      total: 0,
      success: 0,
      errors: [],
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
          errors: Array.isArray(error.message)
            ? error.message
            : [error.message],
        });
      }
    }

    return result;
  }

  async importInstallments(
    file: MulterFile,
    storeId: number,
  ): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Файл не содержит данных');
    }

    const result: ImportResult = {
      total: 0,
      success: 0,
      errors: [],
    };

    const rows = worksheet.getRows(2, worksheet.rowCount - 1) || [];
    result.total = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.values.length === 0) {
        continue;
      }
      const rowNumber = i + 2;

      try {
        await this.createInstallmentWithCustomer(row, storeId);
        result.success++;
      } catch (error) {
        console.log(error);
        const messages = error.message
          ? error.message.split('; ')
          : ['Неизвестная ошибка'];
        result.errors.push({
          row: rowNumber,
          errors: messages,
        });
      }
    }

    return result;
  }

  private parseClientRow(row: ExcelJS.Row): ClientRow {
    const cells = row.values as any[];

    return {
      firstName: this.getRequiredStringValue(cells[1]),
      lastName: this.getRequiredStringValue(cells[2]),
      middleName: this.getOptionalStringValue(cells[3]),
      passportSeries: this.getRequiredStringValue(cells[4]),
      passportNumber: this.getRequiredStringValue(cells[5]),
      phone: this.getRequiredStringValue(cells[6]),
      additionalPhoneNumber: this.getRequiredStringValue(cells[7]),
      address: this.getOptionalStringValue(cells[8]),
    };
  }

  private getRequiredStringValue(value: any): string {
    if (value === null || value === undefined) {
      throw new Error('Поле обязательно для заполнения');
    }
    const str = String(value).trim();
    if (!str) {
      throw new Error('Поле не может быть пустым');
    }
    return str;
  }

  private getOptionalStringValue(value: any): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const str = String(value).trim();
    if (!str) {
      return undefined;
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
      throw new Error(
        'Некорректный формат даты. Используйте формат DD.MM.YYYY или ISO',
      );
    }
    return date;
  }

  private parseInstallmentRow(row: ExcelJS.Row): InstallmentRow {
    const cells = row.values as any[];

    return {
      customerFirstName: this.getRequiredStringValue(cells[1]),
      customerLastName: this.getRequiredStringValue(cells[2]),
      customerMiddleName: this.getOptionalStringValue(cells[3]),
      passportSeries: this.getRequiredStringValue(cells[4]),
      passportNumber: this.getRequiredStringValue(cells[5]),
      customerPhone: this.getRequiredStringValue(cells[6]),
      customerAdditionalPhoneNumber: this.getRequiredStringValue(cells[7]),
      customerAddress: this.getOptionalStringValue(cells[8]),
      productName: this.getRequiredStringValue(cells[9]),
      productPrice: this.getNumberValue(cells[10]),
      downPayment: this.getNumberValue(cells[11]),
      interestRate: this.getNumberValue(cells[12]),
      months: this.getNumberValue(cells[13]),
      createdAt: this.getDateValue(cells[14]).toISOString(),
      managerLogin: this.getRequiredStringValue(cells[15]),
    };
  }

  private async validateClientData(
    data: ClientRow,
    storeId: number,
  ): Promise<void> {
    const errors: string[] = [];

    // Проверка обязательных полей
    if (!data.firstName) errors.push('Имя обязательно');
    if (!data.lastName) errors.push('Фамилия обязательна');
    if (!data.passportSeries) errors.push('Серия паспорта обязательна');
    if (!data.passportNumber) errors.push('Номер паспорта обязателен');
    if (!data.phone) errors.push('Телефон обязателен');
    if (!data.additionalPhoneNumber)
      errors.push('Дополнительный телефон обязателен');

    // Проверка формата телефона
    const phoneRegex = /998\d{9}$/;
    if (
      data.phone &&
      data.phone.trim() !== '' &&
      !phoneRegex.test(data.phone)
    ) {
      errors.push('Неверный формат телефона (должен быть 998XXXXXXXXX)');
    }
    if (
      data.additionalPhoneNumber &&
      data.additionalPhoneNumber.trim() !== '' &&
      !phoneRegex.test(data.additionalPhoneNumber)
    ) {
      errors.push(
        'Неверный формат дополнительного телефона (должен быть 998XXXXXXXXX)',
      );
    }

    // Проверка уникальности паспорта
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        passportSeries_passportNumber: {
          passportSeries: data.passportSeries,
          passportNumber: data.passportNumber,
        },
      },
    });

    if (existingCustomer) {
      errors.push('Клиент с таким паспортом уже существует');
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
        additionalPhoneNumber: data.additionalPhoneNumber,
        address: data.address,
        storeId: storeId,
        isBlacklisted: false,
      },
    });
  }

  private async createInstallmentWithCustomer(
    row: ExcelJS.Row,
    storeId: number,
  ): Promise<void> {
    const data = this.parseInstallmentRow(row);

    await this.prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findUnique({
        where: {
          passportSeries_passportNumber: {
            passportSeries: data.passportSeries,
            passportNumber: data.passportNumber,
          },
        },
      });

      if (customer) {
        if (customer.storeId !== storeId) {
          throw new Error('Клиент принадлежит другому магазину');
        }
      } else {
        const customerErrors: string[] = [];
        if (!data.customerFirstName)
          customerErrors.push('Имя клиента обязательно');
        if (!data.customerLastName)
          customerErrors.push('Фамилия клиента обязательна');
        if (!data.passportSeries)
          customerErrors.push('Серия паспорта обязательна');
        if (!data.passportNumber)
          customerErrors.push('Номер паспорта обязателен');
        if (!data.customerPhone)
          customerErrors.push('Телефон клиента обязателен');
        if (!data.customerAdditionalPhoneNumber)
          customerErrors.push('Дополнительный телефон клиента обязателен');

        const phoneRegex = /998\d{9}$/;
        if (data.customerPhone && !phoneRegex.test(data.customerPhone)) {
          customerErrors.push(
            'Неверный формат телефона (должен быть 998XXXXXXXXX)',
          );
        }
        if (
          data.customerAdditionalPhoneNumber &&
          !phoneRegex.test(data.customerAdditionalPhoneNumber)
        ) {
          customerErrors.push(
            'Неверный формат дополнительного телефона (должен быть 998XXXXXXXXX)',
          );
        }
        if (customerErrors.length > 0) {
          throw new Error(customerErrors.join('; '));
        }

        customer = await tx.customer.create({
          data: {
            firstName: data.customerFirstName,
            lastName: data.customerLastName,
            middleName: data.customerMiddleName,
            passportSeries: data.passportSeries,
            passportNumber: data.passportNumber,
            phone: data.customerPhone,
            additionalPhoneNumber: data.customerAdditionalPhoneNumber,
            address: data.customerAddress,
            storeId: storeId,
            isBlacklisted: false,
          },
        });
      }

      const installmentErrors: string[] = [];
      if (!data.productName)
        installmentErrors.push('Название товара обязательно');
      if (data.productPrice <= 0)
        installmentErrors.push('Цена товара должна быть больше 0');
      if (data.downPayment < 0)
        installmentErrors.push(
          'Первоначальный взнос не может быть отрицательным',
        );
      if (data.interestRate < 0)
        installmentErrors.push('Процентная ставка не может быть отрицательной');
      if (data.months <= 0) installmentErrors.push('Срок должен быть больше 0');
      if (!data.createdAt) installmentErrors.push('Дата создания обязательна');
      if (!data.managerLogin)
        installmentErrors.push('Логин менеджера обязателен');
      if (data.downPayment >= data.productPrice) {
        installmentErrors.push(
          'Первоначальный взнос не может быть больше или равен цене товара',
        );
      }
      if (installmentErrors.length > 0) {
        throw new Error(installmentErrors.join('; '));
      }

      const manager = await tx.user.findUnique({
        where: {
          login: data.managerLogin,
        },
      });

      if (!manager) {
        throw new Error(`Менеджер с логином ${data.managerLogin} не найден`);
      }

      const base = data.productPrice - data.downPayment;
      const totalAmount = base * (1 + data.interestRate / 100);
      const monthlyPayment = totalAmount / data.months;

      const installment = await tx.installment.create({
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
          managerId: manager.id, // Убираем опциональность, передаем прямо ID
          createdAt: new Date(data.createdAt),
        },
      });

      console.log(`Created installment with ID: ${installment.id}`);

      // Создаем платежи с правильными статусами (учитываем просроченные)
      const startDate = new Date(data.createdAt);
      const currentDate = new Date();

      for (let i = 1; i <= data.months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);

        // Определяем статус платежа: если дата платежа уже прошла - overdue, иначе pending
        const paymentStatus =
          dueDate < currentDate ? PaymentStatus.overdue : PaymentStatus.pending;

        try {
          await tx.payment.create({
            data: {
              amount: new Decimal(monthlyPayment),
              dueDate: dueDate,
              status: paymentStatus, // Используем вычисленный статус
              installmentId: installment.id,
              type: 'ordinary',
            },
          });

          console.log(
            `Payment ${i}: dueDate=${dueDate.toISOString()}, status=${paymentStatus}`,
          );
        } catch (error) {
          console.error(
            `Error creating payment ${i} for installment ${installment.id}:`,
            error,
          );
          throw new Error(`Ошибка создания платежа ${i}: ${error.message}`);
        }
      }

      // Если есть просроченные платежи, меняем статус рассрочки на overdue
      const hasOverduePayments = await tx.payment.count({
        where: {
          installmentId: installment.id,
          status: PaymentStatus.overdue,
        },
      });

      if (hasOverduePayments > 0) {
        await tx.installment.update({
          where: { id: installment.id },
          data: { status: 'overdue' },
        });
        console.log(
          `Installment ${installment.id} status updated to overdue due to ${hasOverduePayments} overdue payments`,
        );
      }

      console.log(
        `Successfully created ${data.months} payments for installment ${installment.id}`,
      );
    });
  }
}
