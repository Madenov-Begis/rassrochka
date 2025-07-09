/**
 * @file: update-customer.dto.ts
 * @description: DTO для обновления клиента
 * @dependencies: class-validator
 * @created: 2024-07-05
 */
import { PartialType } from '@nestjs/mapped-types'
import { CreateCustomerDto } from './create-customer.dto'

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {} 