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

  @Get(":id")
  async getFull(@Param('id') id: number, @Query() query: { page?: number; limit?: number }) {
    const store = await this.storesService.findOne(id)
    const users = await this.storesService.getUsers(id)
    const installments = await this.storesService.getInstallments(id, {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 1000, // отдаём все, если не указано
    })
    return {
      ...store,
      users,
      installments: installments.items,
    }
  }

  @Get()
  async findAll(@Query() query: { search?: string; page?: number; limit?: number }) {
    return this.storesService.findAll({
      search: query.search,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    });
  }

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Put(":id/status")
  async updateStatus(@Param('id') id: number, @Body() updateStatusDto: UpdateStoreDto) {
    if (!updateStatusDto.status) throw new Error('Status is required')
    return this.storesService.updateStatus(id, updateStatusDto.status)
  }

  @Put(":id")
  async update(@Param('id') id: number, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto)
  }

  @Delete(":id")
  async remove(@Param('id') id: number) {
    return this.storesService.remove(id)
  }
}
