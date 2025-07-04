import { Controller, Get, Post, Param, Put, UseGuards, Query } from "@nestjs/common"
import { InstallmentsService } from "./installments.service"
import { CreateInstallmentDto } from "./dto/create-installment.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { CurrentUser } from "../../auth/decorators/current-user.decorator"

@Controller("client/installments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("store_manager")
export class InstallmentsController {
  constructor(private installmentsService: InstallmentsService) {}

  @Post()
  create(createInstallmentDto: CreateInstallmentDto, @CurrentUser() user: any) {
    return this.installmentsService.create(createInstallmentDto, user.storeId)
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.installmentsService.findAll(user.storeId, query)
  }

  @Get(":id")
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.installmentsService.findOne(id, user.storeId)
  }

  @Put(":id/pay-off-early")
  payOffEarly(@Param('id') id: string, @CurrentUser() user: any) {
    return this.installmentsService.payOffEarly(id, user.storeId)
  }

  @Get(":id/payments")
  getPayments(@Param('id') id: string, @CurrentUser() user: any) {
    return this.installmentsService.getPayments(id, user.storeId)
  }
}
