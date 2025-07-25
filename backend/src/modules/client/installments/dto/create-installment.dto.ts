import { IsString, IsNumber, IsPositive, IsInt, Min, Max, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator"
import { Type } from "class-transformer"

@ValidatorConstraint({ name: "isProductPriceGreater", async: false })
export class IsProductPriceGreaterThanDownPayment implements ValidatorConstraintInterface {
  validate(productPrice: number, args: ValidationArguments) {
    const dto = args.object as any
    return typeof productPrice === 'number' && typeof dto.downPayment === 'number' && productPrice > dto.downPayment
  }
  defaultMessage(args: ValidationArguments) {
    return "Стоимость товара должна быть больше первоначального взноса"
  }
}

export class CreateInstallmentDto {
  @IsString()
  productName: string

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @Validate(IsProductPriceGreaterThanDownPayment)
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

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  managerId: number
}
