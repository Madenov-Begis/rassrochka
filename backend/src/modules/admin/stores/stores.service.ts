import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import type { CreateStoreDto } from "./dto/create-store.dto"
import { StoreStatus } from "@prisma/client"

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(options: {
    search?: string
    page: number
    limit: number
  }) {
    const { search, page, limit } = options
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where: where as any, // Type assertion to bypass type error
        skip,
        take: limit,
        include: {
          users: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.store.count({ where: where as any }),
    ])

    const storesWithUserCount = stores.map((store) => ({
      ...store,
      users: store.users.length,
    }))

    return {
      data: storesWithUserCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: id },
      include: {
        users: true,
      },
    })

    if (!store) {
      throw new NotFoundException("Store not found")
    }

    return store
  }

  async create(createStoreDto: CreateStoreDto) {
    return this.prisma.store.create({
      data: createStoreDto,
    })
  }

  async updateStatus(id: number, status: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: id },
    })

    if (!store) {
      throw new NotFoundException("Store not found")
    }

    return this.prisma.store.update({
      where: { id: id },
      data: { status: status as StoreStatus },
    })
  }

  async getStats(id: number) {
    const [totalCustomers, totalInstallments, activeInstallments, overdueInstallments, totalAmount] = await Promise.all(
      [
        this.prisma.customer.count({
          where: { storeId: id },
        }),
        this.prisma.installment.count({
          where: { storeId: id },
        }),
        this.prisma.installment.count({
          where: { storeId: id, status: "active" },
        }),
        this.prisma.installment.count({
          where: { storeId: id, status: "overdue" },
        }),
        this.prisma.installment.aggregate({
          where: { storeId: id },
          _sum: { totalAmount: true },
        }),
      ],
    )

    return {
      totalCustomers,
      totalInstallments,
      activeInstallments,
      overdueInstallments,
      totalAmount: totalAmount._sum.totalAmount || 0,
    }
  }

  async getUsers(id: number) {
    return this.prisma.user.findMany({
      where: { storeId: id },
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
        // lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async getInstallments(
    id: number,
    options: {
      page: number
      limit: number
    },
  ) {
    const { page, limit } = options
    const skip = (page - 1) * limit

    const [installments, total] = await Promise.all([
      this.prisma.installment.findMany({
        where: { storeId: id },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.installment.count({
        where: { storeId: id },
      }),
    ])

    return {
      data: installments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(id: number, updateStoreDto: any) {
    const store = await this.prisma.store.findUnique({ where: { id } })
    if (!store) throw new NotFoundException('Store not found')
    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
    })
  }

  async remove(id: number) {
    const store = await this.prisma.store.findUnique({ where: { id } })
    if (!store) throw new NotFoundException('Store not found')
    const [customersCount, installmentsCount, usersCount] = await Promise.all([
      this.prisma.customer.count({ where: { storeId: id } }),
      this.prisma.installment.count({ where: { storeId: id } }),
      this.prisma.user.count({ where: { storeId: id } }),
    ]);
    if (customersCount > 0 || installmentsCount > 0 || usersCount > 0) {
      let reason = 'Нельзя удалить магазин, пока есть:';
      if (customersCount > 0) reason += `\n- Клиенты (${customersCount})`;
      if (installmentsCount > 0) reason += `\n- Рассрочки (${installmentsCount})`;
      if (usersCount > 0) reason += `\n- Пользователи (${usersCount})`;
      throw new BadRequestException(reason);
    }
    return this.prisma.store.delete({ where: { id } })
  }
}
