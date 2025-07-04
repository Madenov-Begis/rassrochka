import { IsString, IsEnum, IsOptional, MinLength } from "class-validator"

export class CreateUserDto {
  @IsString()
  login: string

  @IsString()
  @MinLength(6)
  password: string

  @IsEnum(["admin", "store_manager"])
  role: "admin" | "store_manager"

  @IsOptional()
  @IsString()
  storeId?: string
}
