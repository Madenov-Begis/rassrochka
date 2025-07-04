import { Module } from "@nestjs/common"
import { CustomersModule } from "./customers/customers.module"
import { PaymentsModule } from "./payments/payments.module"
import { StatsModule } from "./stats/stats.module"
import { InstallmentsModule } from "./installments/installments.module"

@Module({
  imports: [CustomersModule, PaymentsModule, StatsModule, InstallmentsModule],
})
export class ClientModule {}
