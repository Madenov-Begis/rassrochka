/**
 * @file: import.module.ts
 * @description: Модуль импорта клиентов и рассрочек для магазинов
 * @dependencies: ImportController, ImportService
 * @created: 2024-07-16
 */

import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}