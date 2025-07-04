import { Controller, Get, UseGuards, Req } from "@nestjs/common"
import { StatsService } from "./stats.service"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"

@Controller("client/stats")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("store_manager")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(@Req() req: any) {
    return this.statsService.getStoreStats(req.user.storeId)
  }
}
