import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule } from "@nestjs/throttler"
import { PrismaModule } from "./prisma/prisma.module"
import { AuthModule } from "./modules/auth/auth.module"
import { ClientModule } from "./modules/client/client.module"
import { AdminModule } from "./modules/admin/admin.module"
import { SchedulerModule } from "./modules/scheduler/scheduler.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    ClientModule,
    AdminModule,
    SchedulerModule,
  ],
})
export class AppModule {}
