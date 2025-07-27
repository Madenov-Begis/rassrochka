import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentSchedulerService } from './payment-scheduler.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [PaymentSchedulerService],
})
export class SchedulerModule {}
