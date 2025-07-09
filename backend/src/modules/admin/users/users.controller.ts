import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.usersService.findAll({
      search,
      page: Number(page),
      limit: Number(limit),
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Get(':id/activity')
  async getActivity(@Param('id') id: number) {
    return this.usersService.getActivity(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(":id/status")
  async updateStatus(@Param('id') id: number, @Body('isActive') isActive: boolean) {
    return this.usersService.updateStatus(id, isActive)
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() update: { login?: string; role?: string; storeId?: number; status?: string; password?: string }) {
    return this.usersService.updateUser(id, update);
  }
}
