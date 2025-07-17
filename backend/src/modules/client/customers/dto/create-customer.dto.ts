import { IsString, IsNotEmpty, IsOptional, Matches } from "class-validator"
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsString()
  @IsOptional()
  middleName?: string

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  @Matches(/^[A-Z]{2}$/, { message: 'Серия паспорта: 2 латинские заглавные буквы' })
  passportSeries: string

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{7}$/, { message: 'Номер паспорта должен состоять из 7 цифр' })
  passportNumber: string

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, { message: 'Телефон должен быть в формате +998XXXXXXXXX' })
  phone: string

  @IsString()
  @IsNotEmpty()
  address: string
}
