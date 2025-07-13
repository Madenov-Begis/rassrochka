import { Controller, Get, Put, Param, UseGuards, Req, Query, Body } from "@nestjs/common"
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

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return this.paymentsService.findAll(req.user.storeId, query)
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param('id') id: number) {
    return this.paymentsService.findOne(req.user.storeId, id)
  }

  @Put(":id/mark-paid")
  async markPaid(
    @Req() req: any,
    @Param('id') id: number,
    @Body() body: { amount: number }
  ) {
    return this.paymentsService.markPaid(req.user.storeId, id, body.amount)
  }
}
