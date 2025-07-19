import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { CreateInstallmentDto } from "./dto/create-installment.dto"
import { Prisma } from "@prisma/client"

@Injectable()
export class InstallmentsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createInstallmentDto: CreateInstallmentDto, storeId: number) {
    const { productPrice, downPayment, interestRate, months, customerId } = createInstallmentDto

    // Получаем клиента
    const customer = await this.prisma.customer.findUnique({ where: { id: Number(customerId) } })
    if (!customer) throw new NotFoundException('Клиент не найден')

    // Проверка: если клиент в чёрном списке этого магазина — запретить оформление рассрочки
    if (customer.isBlacklisted && customer.storeId === storeId) {
      throw new BadRequestException('Клиент в чёрном списке этого магазина, оформление рассрочки запрещено')
    }

    // Расчет рассрочки (простые проценты)
    const base = productPrice - downPayment;
    const totalInterest = base * interestRate * months / 100;
    const totalAmount = base + totalInterest;
    const monthlyPayment = totalAmount / months;

    const installment = await this.prisma.installment.create({
      data: {
        ...createInstallmentDto,
        customerId: Number(customerId),
        totalAmount: new Prisma.Decimal(totalAmount),
        monthlyPayment: new Prisma.Decimal(monthlyPayment),
        storeId,
      },
      include: {
        customer: true,
      },
    })

    // Создание платежей
    const payments: any[] = []
    const startDate = new Date()

    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i + 1)

      payments.push({
        amount: new Prisma.Decimal(monthlyPayment),
        dueDate,
        installmentId: installment.id,
      })
    }

    await this.prisma.payment.createMany({
      data: payments,
    })

    return installment
  }

  async findAll(storeId: number, query: any) {
    let { status, search, page = 1, limit = 10 } = query
    page = Number(page)
    limit = Number(limit)

    const where: any = { storeId }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: "insensitive" } },
        { customer: { firstName: { contains: search, mode: "insensitive" } } },
        { customer: { lastName: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [installments, total] = await Promise.all([
      this.prisma.installment.findMany({
        where: where as any,
        include: {
          customer: true,
          payments: {
            where: { status: "overdue" },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.installment.count({ where: where as any }),
    ])

    return {
      items: installments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: number, storeId: number) {
    const installment = await this.prisma.installment.findFirst({
      where: { id, storeId },
      include: {
        customer: true,
        payments: {
          orderBy: { dueDate: "asc" },
        },
      },
    })

    if (!installment) {
      throw new NotFoundException("Installment not found")
    }

    return installment
  }

  async payOffEarly(id: number, storeId: number) {
    const installment = await this.findOne(id, storeId)

    // Проверка наличия просроченных платежей
    const overduePayments = await this.prisma.payment.findMany({
      where: {
        installmentId: id,
        status: "overdue",
      },
    })
    if (overduePayments.length > 0) {
      throw new Error('Сначала оплатите все просроченные платежи')
    }

    // Найти все неоплаченные платежи
    const pendingPayments = installment.payments.filter(p => p.status === 'pending')
    const now = new Date()
    // Проверка: если есть просроченные pending (по дате)
    const hasLatePending = pendingPayments.some(p => new Date(p.dueDate) < now)
    if (hasLatePending) {
      throw new Error('Нельзя досрочно погасить рассрочку с просроченными платежами')
    }

    // Основной долг
    const base = Number(installment.productPrice) - Number(installment.downPayment)
    const months = Number(installment.months)
    const principalPerMonth = base / months
    // Сколько месяцев уже оплачено (по основному долгу)
    const paidCount = installment.payments.filter(p => p.status === 'paid').length
    let remainingAmount = base - paidCount * principalPerMonth
    if (remainingAmount < 0) remainingAmount = 0

    // Сумма всех оплаченных платежей
    const paidPayments = installment.payments.filter(p => p.status === 'paid');
    const paidSum = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    // Новая общая сумма рассрочки: оплачено + сумма к досрочному погашению
    const newTotalAmount = paidSum + remainingAmount;

    // Отменяем все неоплаченные платежи
    const pendingIds = pendingPayments.map(p => p.id)
    if (pendingIds.length > 0) {
      await this.prisma.payment.updateMany({
        where: { id: { in: pendingIds } },
        data: { status: "cancelled" },
      })
    }

    // Создаём платёж досрочного погашения
    await this.prisma.payment.create({
      data: {
        amount: new Prisma.Decimal(remainingAmount),
        dueDate: now,
        paidDate: now,
        status: "paid",
        type: "early_payoff",
        installmentId: id,
      },
    })

    // Обновляем статус и сумму рассрочки
    await this.prisma.installment.update({
      where: { id },
      data: { status: "early_payoff", totalAmount: newTotalAmount },
    })

    return {
      remainingAmount,
      message: "Installment can be closed early by paying only the principal for the remaining months (без процентов)",
      newTotalAmount,
    }
  }

  async getPayments(id: number, storeId: number) {
    await this.findOne(id, storeId) // Проверка доступа

    return this.prisma.payment.findMany({
      where: { installmentId: id },
      orderBy: { dueDate: "asc" },
      include: { paymentHistory: true },
    })
  }
}
