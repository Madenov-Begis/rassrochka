import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "../../prisma/prisma.service"
import { LoginDto } from "./dto/login.dto"
import * as bcrypt from "bcrypt"
import { StoreStatus } from "@prisma/client"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: loginDto.login },
      include: { store: true },
    })

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Проверка статуса магазина для store_manager
    if (user.role === 'store_manager' && user.store && user.store.status === StoreStatus.inactive) {
      throw new UnauthorizedException('Магазин неактивен, вход невозможен');
    }


    const payload = {
      sub: user.id,
      login: user.login,
      role: user.role,
      storeId: user.storeId,
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        store: user.store,
      },
    }
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        role: true,
        store: true,
      },
    })
  }
}
