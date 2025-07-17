/**
 * @file: update-customer.dto.ts
 * @description: DTO для обновления клиента
 * @dependencies: class-validator
 * @created: 2024-07-05
 */
import { PartialType } from '@nestjs/mapped-types'
import { CreateCustomerDto } from './create-customer.dto'
import { IsString, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsString()
  @IsOptional()
  @Matches(/^\+998\d{9}$/, { message: 'Телефон должен быть в формате +998XXXXXXXXX' })
  phone?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @Matches(/^[A-Z]{2}$/, { message: 'Серия паспорта: 2 латинские заглавные буквы' })
  passportSeries?: string;
} 