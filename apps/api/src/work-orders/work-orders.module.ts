import { Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';

@Module({
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService, PrismaService, PdfService],
})
export class WorkOrdersModule {}
