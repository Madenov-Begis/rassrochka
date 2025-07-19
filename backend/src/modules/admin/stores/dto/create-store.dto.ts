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
  @Matches(/^998\d{9}$/, { message: 'Телефон должен быть в формате +998XXXXXXXXX' })
  phone: string;

  @IsOptional()
  status?: StoreStatus;
}
