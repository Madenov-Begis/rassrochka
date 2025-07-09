import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from "@nestjs/common"
import { CustomersService } from "./customers.service"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { UpdateCustomerDto } from "./dto/update-customer.dto"
import { InstallmentsService } from "../installments/installments.service"
import { CurrentUser } from "../../auth/decorators/current-user.decorator"

@Controller("client/customers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private installmentsService: InstallmentsService,
  ) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.customersService.findAll(req.user.storeId, {
      search,
      page: Number(page),
      limit: Number(limit),
    })
  }

  @Get("search")
  async searchByPassport(@Req() req: any, @Query('passport') passport: string) {
    return this.customersService.searchByPassport(req.user.storeId, passport)
  }

  @Get("search-global")
  async searchByPassportGlobal(@Query('passport') passport: string) {
    return this.customersService.searchByPassportGlobal(passport)
  }

  @Get(":id")
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.customersService.findOne(req.user.storeId, id)
  }

  @Post()
  async create(@Req() req: any, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(req.user.storeId, createCustomerDto)
  }

  @Put(":id/blacklist")
  async updateBlacklist(@Req() req: any, @Param('id') id: string, @Body('isBlacklisted') isBlacklisted: boolean) {
    return this.customersService.updateBlacklist(req.user.storeId, id, isBlacklisted)
  }

  @Put(":id")
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    return this.customersService.update(req.user.storeId, id, updateCustomerDto)
  }

  @Get(":id/installments")
  findCustomerInstallments(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.installmentsService.findByCustomer(user.storeId, id, page, limit)
  }
}
