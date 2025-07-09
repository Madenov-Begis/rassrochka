import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import type { CreateCustomerDto } from "./dto/create-customer.dto"
import { Prisma } from "@prisma/client"

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    storeId: number,
    options: {
      search?: string
      page: number
      limit: number
    },
  ) {
    const { search, page, limit } = options
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10
    const skip = (pageNum - 1) * limitNum

    const where: any = {
      storeId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { middleName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { passportSeries: { contains: search } },
          { passportNumber: { contains: search } },
        ],
      }),
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          installments: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.customer.count({ where }),
    ])

    return {
      items: customers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  async findOne(storeId: number, id: number) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, storeId },
      include: {
        installments: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!customer) {
      throw new NotFoundException("Customer not found")
    }

    return customer
  }

  async create(storeId: number, createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: {
          ...createCustomerDto,
          storeId,
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Клиент с такими паспортными данными уже существует"
        )
      }
      throw error
    }
  }

  async searchByPassportGlobal(series: string, number: string) {
    const clients = await this.prisma.customer.findMany({
      where: {
        passportSeries: series,
        passportNumber: number,
      },
      include: {
        installments: true,
        store: true,
      },
    })

    // Оставляем только магазины, где клиент в чёрном списке или есть просрочка
    // В выдаче для каждого клиента оставляем только просроченные рассрочки
    return clients
      .filter(
        c => c.isBlacklisted || c.installments.some(inst => inst.status === "overdue")
      )
      .map(c => ({
        ...c,
        installments: c.installments.filter(inst => inst.status === "overdue"),
      }))
  }

  async updateBlacklist(storeId: number, id: number, isBlacklisted: boolean) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, storeId },
    })

    if (!customer) {
      throw new NotFoundException("Customer not found")
    }

    return this.prisma.customer.update({
      where: { id },
      data: { isBlacklisted },
    })
  }

  async update(storeId: number, id: number, updateCustomerDto: any) {
    // Проверка уникальности паспорта, если меняется серия/номер
    if (updateCustomerDto.passportSeries && updateCustomerDto.passportNumber) {
      const exists = await this.prisma.customer.findFirst({
        where: {
          storeId,
          passportSeries: updateCustomerDto.passportSeries,
          passportNumber: updateCustomerDto.passportNumber,
          NOT: { id },
        },
      })
      if (exists) {
        throw new Error('Клиент с таким паспортом уже существует')
      }
    }
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    })
  }
}
