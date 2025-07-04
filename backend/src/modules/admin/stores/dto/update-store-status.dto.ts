/**
 * @file: update-store-status.dto.ts
 * @description: DTO для обновления магазина
 * @dependencies: class-validator
 * @created: 2024-07-03
 */

import { IsString, IsOptional, Matches } from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/, { message: 'Телефон в формате +998 (90) 123-45-67' })
  phone?: string;

  @IsOptional()
  status?: StoreStatus;
}
