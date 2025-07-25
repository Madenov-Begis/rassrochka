/**
 * @file: update-installment.dto.ts
 * @description: DTO для обновления рассрочки, поддерживает смену менеджера и других полей
 * @dependencies: CreateInstallmentDto
 * @created: 2024-07-17
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateInstallmentDto } from './create-installment.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateInstallmentDto extends PartialType(CreateInstallmentDto) {
  @IsOptional()
  @IsInt()
  managerId?: number;
} 