import { Controller, Get, Put, Param, UseGuards, Req } from "@nestjs/common"
import { PaymentsService } from "./payments.service"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"

@Controller("client/payments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("overdue")
  async getOverdue(@Req() req: any) {
    return this.paymentsService.getOverdue(req.user.storeId)
  }

  @Get("upcoming")
  async getUpcoming(@Req() req: any) {
    return this.paymentsService.getUpcoming(req.user.storeId)
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.paymentsService.findOne(req.user.storeId, id)
  }

  @Put(":id/mark-paid")
  async markPaid(@Req() req: any, @Param('id') id: string) {
    return this.paymentsService.markPaid(req.user.storeId, id)
  }
}
