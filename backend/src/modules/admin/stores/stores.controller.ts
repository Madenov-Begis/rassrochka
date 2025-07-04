import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Delete } from "@nestjs/common"
import { StoresService } from "./stores.service"
import { CreateStoreDto } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store-status.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"

@Controller("admin/stores")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async findAll(@Query() query: { search?: string; page?: number; limit?: number }) {
    return this.storesService.findAll({
      search: query.search,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.storesService.getStats(id);
  }

  @Get(':id/users')
  async getUsers(@Param('id') id: string) {
    return this.storesService.getUsers(id);
  }

  @Get(":id/installments")
  async getInstallments(@Param('id') id: string, @Query() query: { page?: number; limit?: number }) {
    return this.storesService.getInstallments(id, {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    })
  }

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Put(":id/status")
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStoreDto) {
    if (!updateStatusDto.status) throw new Error('Status is required')
    return this.storesService.updateStatus(id, updateStatusDto.status)
  }

  @Put(":id")
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto)
  }

  @Delete(":id")
  async remove(@Param('id') id: string) {
    return this.storesService.remove(id)
  }
}
