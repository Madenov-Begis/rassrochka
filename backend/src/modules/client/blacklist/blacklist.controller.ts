/**
 * @file: blacklist.controller.ts
 * @description: Контроллер для работы с чёрным списком клиентов (client API)
 * @dependencies: BlacklistService
 * @created: 2024-07-03
 */

import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AddToBlacklistDto } from './dto/add-to-blacklist.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('client/blacklist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlacklistController {
  constructor(private readonly blacklistService: BlacklistService) {}

  @Post()
  @Roles('store_manager')
  async addToBlacklist(
    @Body(new ValidationPipe()) dto: AddToBlacklistDto,
    @Req() req: any
  ) {
    const userId = req.user.id;
    await this.blacklistService.addToBlacklist({
      ...dto,
      addedByUserId: userId,
    });
    return { success: true };
  }

  @Get('check')
  @Roles('store_manager')
  async checkBlacklist(@Query('series') series: string, @Query('number') number: string) {
    return this.blacklistService.checkBlacklist(series, number);
  }
} 