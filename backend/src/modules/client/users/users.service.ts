import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findStoreManagers(storeId: number) {
    return this.prisma.user.findMany({
      where: {
        storeId,
        role: 'store_manager',
        status: 'active'
      },
      select: {
        id: true,
        login: true,
        storeId: true,
        store: {
          select: {
            name: true
          }
        }
      },
      orderBy: { login: 'asc' }
    }).then(managers => 
      managers.map(manager => ({
        id: manager.id,
        login: manager.login,
      }))
    );
  }
}
