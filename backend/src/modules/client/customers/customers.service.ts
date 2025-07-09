import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import type { CreateCustomerDto } from "./dto/create-customer.dto"

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    storeId: string,
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

    const where = {
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
        where: where as any,
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
      this.prisma.customer.count({ where: where as any }),
    ])

    return {
      data: customers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  async findOne(storeId: string, id: string) {
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

  async create(storeId: string, createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        storeId,
      },
    })
  }

  async searchByPassport(storeId: string, passport: string) {
    const [series, number] = passport.split(" ")

    return this.prisma.customer.findFirst({
      where: {
        storeId,
        passportSeries: series,
        passportNumber: number,
      },
    })
  }

  async searchByPassportGlobal(passport: string) {
    const [series, number] = passport.split(" ")

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

    // Оставляем только магазины, где есть просрочка или клиент в чёрном списке
    return clients.filter(
      c => c.installments.some(inst => inst.status === "overdue")
    )
  }

  async updateBlacklist(storeId: string, id: string, isBlacklisted: boolean) {
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

  async update(storeId: string, id: string, updateCustomerDto: any) {
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
