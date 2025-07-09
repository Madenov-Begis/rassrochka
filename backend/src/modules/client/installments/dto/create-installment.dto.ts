import { IsString, IsNumber, IsPositive, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class CreateInstallmentDto {
  @IsString()
  productName: string

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  productPrice: number

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  downPayment: number

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  interestRate: number

  @IsInt()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  months: number

  @IsString()
  customerId: number
}
