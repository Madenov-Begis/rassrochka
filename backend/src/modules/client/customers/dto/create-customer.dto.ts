import { IsString, IsNotEmpty, IsOptional, Matches } from "class-validator"

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
  passportSeries: string

  @IsString()
  @IsNotEmpty()
  passportNumber: string

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998 \(\d{2}\) \d{3}-\d{2}-\d{2}$/, { message: 'Телефон в формате +998 (90) 123-45-67' })
  phone: string

  @IsString()
  @IsNotEmpty()
  address: string
}
