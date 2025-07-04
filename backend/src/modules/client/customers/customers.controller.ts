import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from "@nestjs/common"
import { CustomersService } from "./customers.service"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"

@Controller("client/customers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

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
}
