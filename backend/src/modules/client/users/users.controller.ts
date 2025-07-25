import { Controller, Get, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { CurrentUser } from "../../auth/decorators/current-user.decorator"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { UsersService } from "./users.service"

@Controller("client/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("store_manager")
@ApiTags('Client - Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('store-managers')
  @ApiOperation({ summary: 'Получить список менеджеров текущего магазина' })
  async getStoreManagers(@CurrentUser() user: any) {
    return this.usersService.findStoreManagers(user.storeId);
  }
}
