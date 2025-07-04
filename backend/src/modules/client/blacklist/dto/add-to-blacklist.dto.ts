/**
 * @file: add-to-blacklist.dto.ts
 * @description: DTO для добавления клиента в чёрный список
 * @dependencies: class-validator
 * @created: 2024-07-03
 */

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddToBlacklistDto {
  @IsString()
  @IsNotEmpty()
  passportSeries: string;

  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  customerId?: string;
} 