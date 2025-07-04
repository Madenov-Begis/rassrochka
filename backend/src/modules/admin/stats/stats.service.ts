import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getNetworkStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalStores,
      activeStores,
      totalUsers,
      newUsersThisMonth,
      totalInstallments,
      activeInstallments,
      monthlyRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      this.prisma.store.count(),
      this.prisma.store.count({
        where: { status: "active" },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.installment.count(),
      this.prisma.installment.count({
        where: { status: "active" },
      }),
      this.prisma.installment.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.installment.aggregate({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: { totalAmount: true },
      }),
    ])

    const currentRevenue = Number(monthlyRevenue._sum.totalAmount) || 0
    const previousRevenue = Number(lastMonthRevenue._sum.totalAmount) || 0
    const revenueGrowth =
      Number(previousRevenue) > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
        : 0

    return {
      totalStores,
      activeStores,
      totalUsers,
      newUsersThisMonth,
      totalInstallments,
      activeInstallments,
      totalRevenue: currentRevenue,
      revenueGrowth,
    }
  }

  async getTopStores() {
    const stores = await this.prisma.store.findMany({
      include: {
        installments: {
          select: {
            totalAmount: true,
          },
        },
      },
    })

    return stores
      .map((store) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        revenue: store.installments.reduce((sum, inst) => sum + Number(inst.totalAmount), 0),
        installments: store.installments.length,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  async getSystemAlerts() {
    const overdueStores = await this.prisma.store.count({
      where: { status: "payment_overdue" },
    })

    const blockedStores = await this.prisma.store.count({
      where: { status: "blocked" },
    })

    const alerts: { title: string; description: string; severity: string }[] = []

    if (overdueStores > 0) {
      alerts.push({
        title: "Магазины с просрочкой",
        description: `${overdueStores} магазинов имеют просрочку по платежам`,
        severity: "medium",
      })
    }

    if (blockedStores > 0) {
      alerts.push({
        title: "Заблокированные магазины",
        description: `${blockedStores} магазинов заблокированы`,
        severity: "high",
      })
    }

    return alerts
  }
}
