/**
 * @file: import.controller.ts
 * @description: Контроллер для импорта клиентов и рассрочек из Excel файлов
 * @dependencies: ImportService, JwtAuthGuard, RolesGuard, CurrentUser
 * @created: 2024-07-16
 */

import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ImportService } from './import.service';

// Типы для multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('client/import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('store_manager')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('clients')
  @UseInterceptors(FileInterceptor('file'))
  async importClients(
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: any
  ): Promise<ReturnType<ImportService['importClients']>> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!file.originalname.endsWith('.xlsx')) {
      throw new BadRequestException('Поддерживаются только файлы .xlsx');
    }

    if (!user.storeId) {
      throw new BadRequestException('Пользователь не привязан к магазину');
    }

    return this.importService.importClients(file, user.storeId);
  }

  @Post('installments')
  @UseInterceptors(FileInterceptor('file'))
  async importInstallments(
    @UploadedFile() file: MulterFile,
    @CurrentUser() user: any
  ): Promise<ReturnType<ImportService['importInstallments']>> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!file.originalname.endsWith('.xlsx')) {
      throw new BadRequestException('Поддерживаются только файлы .xlsx');
    }

    if (!user.storeId) {
      throw new BadRequestException('Пользователь не привязан к магазину');
    }

    return this.importService.importInstallments(file, user.storeId);
  }
} 