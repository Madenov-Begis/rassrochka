import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { CreateInstallmentDto } from "./dto/create-installment.dto"
import { Decimal } from "@prisma/client/runtime/library"

@Injectable()
export class InstallmentsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createInstallmentDto: CreateInstallmentDto, storeId: string) {
    const { productPrice, downPayment, interestRate, months, customerId } = createInstallmentDto

    // Получаем клиента
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) throw new NotFoundException('Клиент не найден')

    // Расчет рассрочки
    const base = productPrice - downPayment
    const totalAmount = base * (1 + interestRate / 100)
    const monthlyPayment = totalAmount / months

    const installment = await this.prisma.installment.create({
      data: {
        ...createInstallmentDto,
        totalAmount: new Decimal(totalAmount),
        monthlyPayment: new Decimal(monthlyPayment),
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
        amount: new Decimal(monthlyPayment),
        dueDate,
        installmentId: installment.id,
      })
    }

    await this.prisma.payment.createMany({
      data: payments,
    })

    return installment
  }

  async findAll(storeId: string, query: any) {
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
      data: installments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string, storeId: string) {
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

  async payOffEarly(id: string, storeId: string) {
    const installment = await this.findOne(id, storeId)

    const paidPayments = await this.prisma.payment.findMany({
      where: {
        installmentId: id,
        status: "paid",
      },
    })

    const paidAmount = paidPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
    const base = Number(installment.productPrice) - Number(installment.downPayment)
    const remainingBase = Math.max(0, base - paidAmount)

    // Отменяем все неоплаченные платежи
    await this.prisma.payment.updateMany({
      where: {
        installmentId: id,
        status: "pending",
      },
      data: {
        status: "cancelled",
      },
    })

    // Обновляем статус рассрочки
    await this.prisma.installment.update({
      where: { id },
      data: {
        status: "early_payoff",
      },
    })

    return {
      remainingAmount: remainingBase,
      message: "Installment marked for early payoff",
    }
  }

  async getPayments(id: string, storeId: string) {
    await this.findOne(id, storeId) // Проверка доступа

    return this.prisma.payment.findMany({
      where: { installmentId: id },
      orderBy: { dueDate: "asc" },
    })
  }

  async findByCustomer(storeId: string, customerId: string, page = 1, limit = 10) {
    page = Number(page)
    limit = Number(limit)
    const where = { storeId, customerId }
    const [installments, total] = await Promise.all([
      this.prisma.installment.findMany({
        where,
        include: {
          customer: true,
          payments: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.installment.count({ where }),
    ])
    return {
      data: installments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
