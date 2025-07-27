import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentSchedulerService {
  private readonly logger = new Logger(PaymentSchedulerService.name);

  constructor(private prisma: PrismaService) {
    this.logger.log('PaymentSchedulerService инициализирован.');
  }

  @Cron('0 0 * * *') // Каждый день в полночь
  async handleCron() {
    this.logger.log('Запуск задачи проверки просроченных платежей...');
    const now = new Date();
    this.logger.log(`Текущее время: ${now.toISOString()}`); // Log current time in ISO format

    try {
      // Fetch some pending payments to inspect their due dates
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.pending,
        },
        take: 5, // Take a few to inspect
      });

      if (pendingPayments.length > 0) {
        this.logger.log('Найдены ожидающие платежи:');
        pendingPayments.forEach(p => {
          this.logger.log(`  ID: ${p.id}, DueDate: ${p.dueDate.toISOString()}, Status: ${p.status}`);
        });
      } else {
        this.logger.log('Ожидающие платежи не найдены.');
      }

      const updatedPayments = await this.prisma.payment.updateMany({
        where: {
          status: PaymentStatus.pending,
          dueDate: { lt: now },
        },
        data: {
          status: PaymentStatus.overdue,
        },
      });

      this.logger.log(`Обновлено ${updatedPayments.count} просроченных платежей.`);

      // Если обновили платежи, нужно также обновить статусы рассрочек
      if (updatedPayments.count > 0) {
        const updatedInstallments = await this.prisma.installment.updateMany({
          where: {
            status: 'active',
            payments: {
              some: {
                status: PaymentStatus.overdue,
              },
            },
          },
          data: {
            status: 'overdue',
          },
        });

        this.logger.log(`Обновлено ${updatedInstallments.count} рассрочек на статус "overdue".`);
      }

    } catch (error) {
      this.logger.error('Ошибка при обновлении просроченных платежей:', error.message);
    }
  }
}