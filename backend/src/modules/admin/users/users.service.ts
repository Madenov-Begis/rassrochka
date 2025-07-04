import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import type { CreateUserDto } from "./dto/create-user.dto"
import * as bcrypt from "bcrypt"
import type { Prisma } from "@prisma/client"

@Injectable()
export class UsersService {
  updateStatus(id: string, isActive: boolean) {
    throw new Error("Method not implemented.")
  }
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
          login: { contains: search, mode: "insensitive" },
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          login: true,
          role: true,
          storeId: true,
          createdAt: true,
          status: true,
          store: {
            select: {
              name: true,
              address: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where: where as any }),
    ])

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        role: true,
        storeId: true,
        createdAt: true,
        status: true,
        store: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return user
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const { password, ...userData } = createUserDto

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        login: true,
        role: true,
        storeId: true,
        createdAt: true,
        status: true,
      },
    })
  }

  // async updateStatus(id: string, isActive: boolean) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id },
  //   })

  //   if (!user) {
  //     throw new NotFoundException("User not found")
  //   }

  //   return this.prisma.user.update({
  //     where: { id },
  //     data: { active: isActive as any },
  //     select: {
  //       id: true,
  //       login: true,
  //       role: true,
  //       // isActive: true,
  //       updatedAt: true,
  //     },
  //   })
  // }

  async getActivity(id: string) {
    // В реальном приложении здесь была бы таблица логов активности
    // Пока возвращаем заглушку
    return [
      {
        action: "Вход в систему",
        timestamp: new Date(),
        details: "Успешная авторизация",
      },
    ]
  }

  async updateUser(id: string, update: { login?: string; role?: string; storeId?: string | null; status?: string; password?: string }) {
    const data: Prisma.UserUpdateInput = {}
    if (update.login !== undefined) data.login = update.login
    if (update.role !== undefined) data.role = update.role as any
    if (update.status !== undefined) data.status = update.status as any
    if (update.storeId !== undefined) {
      if (update.storeId) {
        data.store = { connect: { id: update.storeId } }
      } else {
        data.store = { disconnect: true }
      }
    }
    if (update.password) {
      const hashedPassword = await bcrypt.hash(update.password, 10)
      data.password = hashedPassword
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        login: true,
        role: true,
        storeId: true,
        createdAt: true,
        status: true,
        store: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    })
    return user
  }
}
