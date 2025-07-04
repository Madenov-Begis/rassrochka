import { Module } from "@nestjs/common"
import { StoresModule } from "./stores/stores.module"
import { UsersModule } from "./users/users.module"
import { StatsModule } from "./stats/stats.module"

@Module({
  imports: [StoresModule, UsersModule, StatsModule],
})
export class AdminModule {}
