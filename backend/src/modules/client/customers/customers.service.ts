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
}
