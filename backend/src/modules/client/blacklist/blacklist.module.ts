/**
 * @file: blacklist.module.ts
 * @description: Модуль чёрного списка для client API
 * @dependencies: BlacklistService, BlacklistController
 * @created: 2024-07-03
 */

import { Module } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { BlacklistController } from './blacklist.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BlacklistService],
  controllers: [BlacklistController],
})
export class BlacklistModule {} 