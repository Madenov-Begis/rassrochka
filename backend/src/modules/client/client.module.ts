import { Module } from "@nestjs/common"
import { CustomersModule } from "./customers/customers.module"
import { PaymentsModule } from "./payments/payments.module"
import { StatsModule } from "./stats/stats.module"
import { InstallmentsModule } from "./installments/installments.module"
import { ImportModule } from "./import/import.module"

@Module({
  imports: [CustomersModule, PaymentsModule, StatsModule, InstallmentsModule, ImportModule],
})
export class ClientModule {}
