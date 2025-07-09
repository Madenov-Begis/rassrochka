import { Module } from "@nestjs/common"
import { CustomersController } from "./customers.controller"
import { CustomersService } from "./customers.service"
import { PrismaModule } from "../../../prisma/prisma.module"
import { InstallmentsModule } from "../installments/installments.module"

@Module({
  imports: [PrismaModule, InstallmentsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
