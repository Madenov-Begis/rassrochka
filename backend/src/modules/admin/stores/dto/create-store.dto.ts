/**
 * @file: create-store.dto.ts
 * @description: DTO для создания магазина
 * @dependencies: class-validator
 * @created: 2024-07-03
 */

import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/, { message: 'Телефон в формате +998 (90) 123-45-67' })
  phone: string;

  @IsOptional()
  status?: StoreStatus;
}
