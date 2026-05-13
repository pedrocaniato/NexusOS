import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { PdfModule } from './pdf/pdf.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { EquipmentsModule } from './equipments/equipments.module';
import { EmployeesModule } from './employees/employees.module';
import { AnalyticsModule } from './analytics/analytics.module';


@Module({
  imports: [UsersModule, CustomersModule, WorkOrdersModule, ProductsModule, AuthModule, PdfModule, PrismaModule, ServicesModule, EquipmentsModule, EmployeesModule, AnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
