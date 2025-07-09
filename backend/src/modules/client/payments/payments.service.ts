import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"

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
      },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    return payment
  }

  async markPaid(storeId: number, id: number) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        installment: { storeId },
      },
    })

    if (!payment) {
      throw new NotFoundException("Payment not found")
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: "paid",
        paidDate: new Date(),
      },
    })
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
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    return this.prisma.payment.findMany({
      where: {
        installment: { storeId },
        status: "pending",
        dueDate: {
          gte: new Date(),
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
    })
  }
}
