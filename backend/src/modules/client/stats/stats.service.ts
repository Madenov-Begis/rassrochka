import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStoreStats(storeId: number) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalInstallments,
      activeInstallments,
      completedInstallments,
      overdueInstallments,
      newThisMonth,
      monthlyRevenue,
      lastMonthRevenue,
      overduePayments,
      totalActiveAmountAgg,
      totalCustomers,
      blacklistedCustomers,
      overdueCustomers
    ] = await Promise.all([
      this.prisma.installment.count({
        where: { storeId },
      }),
      this.prisma.installment.count({
        where: { storeId, status: "active" },
      }),
      this.prisma.installment.count({
        where: { storeId, status: "completed" },
      }),
      this.prisma.installment.count({
        where: { storeId, status: "overdue" },
      }),
      this.prisma.installment.count({
        where: {
          storeId,
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.installment.aggregate({
        where: {
          storeId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.installment.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.count({
        where: {
          installment: { storeId },
          status: "overdue",
        },
      }),
      this.prisma.installment.aggregate({
        where: { storeId, status: "active" },
        _sum: { totalAmount: true },
      }),
      // --- Клиенты ---
      this.prisma.customer.count({ where: { storeId } }),
      this.prisma.customer.count({ where: { storeId, isBlacklisted: true } }),
      this.prisma.customer.count({
        where: {
          storeId,
          installments: { some: { status: "overdue" } },
        },
      }),
    ])

    // Активные клиенты: не в чёрном списке и без просрочек
    const activeCustomers = await this.prisma.customer.count({
      where: {
        storeId,
        isBlacklisted: false,
        installments: { none: { status: "overdue" } },
      },
    })

    const currentRevenue = Number(monthlyRevenue._sum.totalAmount) || 0
    const previousRevenue = Number(lastMonthRevenue._sum.totalAmount) || 0
    const revenueGrowth =
      Number(previousRevenue) > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
        : 0
    const totalActiveAmount = Number(totalActiveAmountAgg._sum.totalAmount) || 0

    return {
      totalInstallments,
      activeInstallments,
      completedInstallments,
      overdueInstallments,
      newThisMonth,
      monthlyRevenue: currentRevenue,
      revenueGrowth,
      overduePayments,
      totalActiveAmount,
      // --- Клиенты ---
      totalCustomers,
      blacklistedCustomers,
      overdueCustomers,
      activeCustomers,
    }
  }
}
