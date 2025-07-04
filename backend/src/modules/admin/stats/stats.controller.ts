import { Controller, Get, UseGuards } from "@nestjs/common"
import { StatsService } from "./stats.service"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"

@Controller("admin/stats")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats() {
    return this.statsService.getNetworkStats()
  }

  @Get("top-stores")
  async getTopStores() {
    return this.statsService.getTopStores()
  }

  @Get("alerts")
  async getSystemAlerts() {
    return this.statsService.getSystemAlerts()
  }
}
