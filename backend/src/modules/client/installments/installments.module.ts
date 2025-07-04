import { Module } from '@nestjs/common';
import { InstallmentsController } from './installments.controller';
import { InstallmentsService } from './installments.service';
import { BlacklistService } from '../blacklist/blacklist.service';

@Module({
  controllers: [InstallmentsController],
  providers: [InstallmentsService, BlacklistService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {} 