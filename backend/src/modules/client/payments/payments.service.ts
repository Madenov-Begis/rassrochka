import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { Prisma } from "@prisma/client"

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findOne(storeId: number, id: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        installment: { storeId },
      },
      include: {
        installment: {
          include: {
            customer: true,
          },
        },
        paymentHistory: true,
      },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    return payment
  }

  async markPaid(storeId: number, id: number, amount: number) {
    // Получаем все платежи по рассрочке, отсортированные по dueDate
    const payment = await this.prisma.payment.findFirst({
      where: { id, installment: { storeId } },
      include: { installment: true, paymentHistory: true },
    })
    if (!payment) throw new NotFoundException("Payment not found")

    const installmentId = payment.installmentId
    const allPayments = await this.prisma.payment.findMany({
      where: { installmentId },
      orderBy: { dueDate: "asc" },
      include: { paymentHistory: true },
    })

    let payAmount = amount
    for (const p of allPayments) {
      if (p.status === "paid" || p.status === "cancelled") continue
      // Сумма всех оплат по этому платежу
      const paidSum = p.paymentHistory.reduce((sum, h) => sum + Number(h.amount), 0)
      const paidSumRounded = Math.round(paidSum)
      const amountRounded = Math.round(Number(p.amount))
      const EPS = 1 // 1 сум
      const leftToPay = Math.max(0, amountRounded - paidSumRounded)
      if (payAmount <= 0 || leftToPay <= 0) break
      if (payAmount >= leftToPay) {
        // Полная оплата платежа
        if (leftToPay > 0) {
          await this.prisma.paymentHistory.create({
            data: { paymentId: p.id, amount: leftToPay },
          })
        }
        await this.prisma.payment.update({
          where: { id: p.id },
          data: { status: "paid", paidDate: new Date() },
        })
        payAmount -= leftToPay
      } else {
        // Частичная оплата платежа
        if (payAmount > 0) {
          await this.prisma.paymentHistory.create({
            data: { paymentId: p.id, amount: payAmount },
          })
        }
        // Не меняем статус, если не закрыт
        payAmount = 0
        break
      }
    }

    // Перерасчёт графика: если остались "pending" платежи и есть остаток суммы
    const pendingPayments = await this.prisma.payment.findMany({
      where: { installmentId, status: "pending" },
      orderBy: { dueDate: "asc" },
      include: { paymentHistory: true },
    })
    if (pendingPayments.length > 0 && payAmount > 0) {
      const perMonth = payAmount / pendingPayments.length
      for (const p of pendingPayments) {
        await this.prisma.payment.update({
          where: { id: p.id },
          data: { amount: new Prisma.Decimal(Number(p.amount) + perMonth) },
        })
      }
    }

    // ДОПОЛНИТЕЛЬНО: Проверить, что все pending платежи с полной оплатой получают статус 'paid'
    const stillPending = await this.prisma.payment.findMany({
      where: { installmentId, status: "pending" },
      include: { paymentHistory: true },
    })
    for (const p of stillPending) {
      const paidSum = p.paymentHistory.reduce((sum, h) => sum + Number(h.amount), 0)
      const paidSumRounded = Math.round(paidSum)
      const amountRounded = Math.round(Number(p.amount))
      const EPS = 1
      if (Math.abs(paidSumRounded - amountRounded) < EPS) {
        await this.prisma.payment.update({
          where: { id: p.id },
          data: { status: "paid", paidDate: new Date() },
        })
      }
    }

    // Проверить, все ли платежи оплачены
    const left = await this.prisma.payment.count({
      where: { installmentId, status: { in: ["pending", "overdue"] } },
    })
    if (left === 0) {
      await this.prisma.installment.update({
        where: { id: installmentId },
        data: { status: "completed" },
      })
    }

    // Вернуть обновлённый график и остаток
    const updatedPayments = await this.prisma.payment.findMany({
      where: { installmentId },
      orderBy: { dueDate: "asc" },
      include: { paymentHistory: true },
    })
    const totalLeft = updatedPayments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + Number(p.amount), 0)
    return {
      payments: updatedPayments,
      remaining: totalLeft,
    }
  }

  async getOverdue(storeId: number) {
    return this.prisma.payment.findMany({
      where: {
        installment: { storeId },
        status: "pending",
        dueDate: { lt: new Date() },
      },
      include: {
        installment: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    })
  }

  async getUpcoming(storeId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    return this.prisma.payment.findMany({
      where: {
        installment: { storeId },
        status: "pending",
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      include: {
        installment: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    })
  }

  async getByInstallment(storeId: number, installmentId: number) {
    return this.prisma.payment.findMany({
      where: {
        installmentId,
        installment: { storeId },
      },
      orderBy: { dueDate: "asc" },
      include: { paymentHistory: true },
    })
  }

  async findAll(storeId: number, query: any) {
    let { page = 1, limit = 10, search = "" } = query;
    page = Number(page);
    limit = Number(limit);
    const where: any = {
      installment: { storeId },
    };
    if (search) {
      where.OR = [
        { installment: { customer: { firstName: { contains: search, mode: "insensitive" } } } },
        { installment: { customer: { lastName: { contains: search, mode: "insensitive" } } } },
        { installment: { productName: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          installment: {
            include: { customer: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: "desc" },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
