/**
 * @file: blacklist.service.ts
 * @description: Сервис для работы с чёрным списком клиентов
 * @dependencies: PrismaService
 * @created: 2024-07-03
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BlacklistService {
  constructor(private readonly prisma: PrismaService) {}

  async addToBlacklist(params: { passportSeries: string; passportNumber: string; reason: string; addedByUserId: string; customerId?: string }) {
    // Проверка на дубликат
    const exists = await this.prisma.blacklist.findUnique({
      where: {
        passportSeries_passportNumber: {
          passportSeries: params.passportSeries,
          passportNumber: params.passportNumber,
        },
      },
    });
    if (exists) {
      throw new Error('Клиент уже в чёрном списке');
    }
    // Создание записи
    return this.prisma.blacklist.create({
      data: {
        passportSeries: params.passportSeries,
        passportNumber: params.passportNumber,
        reason: params.reason,
        addedByUserId: params.addedByUserId,
        customerId: params.customerId,
      },
    });
  }

  async checkBlacklist(passportSeries: string, passportNumber: string) {
    const entry = await this.prisma.blacklist.findUnique({
      where: {
        passportSeries_passportNumber: {
          passportSeries,
          passportNumber,
        },
      },
    });
    return { blacklisted: !!entry };
  }

  async getReason(passportSeries: string, passportNumber: string) {
    // TODO: реализовать получение причины
  }
} 