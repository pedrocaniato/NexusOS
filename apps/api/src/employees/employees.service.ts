import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll() {
    const employees = await this.prisma.employee.findMany({
      include: {
        workOrders: {
          where: {
            status: { in: ['CONCLUIDO', 'FATURADO'] },
            commissionPaid: false
          },
          select: {
            commissionValue: true
          }
        }
      }
    });

    return employees.map(emp => {
      const totalCommission = emp.workOrders.reduce((sum: number, os: any) => sum + (os.commissionValue || 0), 0);
      const { workOrders, ...rest } = emp;
      return { ...rest, totalCommission };
    });
  }

  findOne(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: { workOrders: true },
    });
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async getMonthlyReport(month: number, year: number) {
    // Busca do primeiro ao último dia do mês
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const employees = await this.prisma.employee.findMany({
      include: {
        workOrders: {
          where: {
            status: { in: ['CONCLUIDO', 'FATURADO'] },
            exitDate: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          include: {
            services: true,
            customer: {
              select: { name: true }
            }
          }
        }
      }
    });

    return employees.map(emp => {
      let totalServices = 0;
      let totalCommission = 0;
      let allPaid = true;

      emp.workOrders.forEach((os: any) => {
        const osServicesTotal = os.services.reduce((acc: number, s: any) => acc + (s.unitPrice * s.quantity), 0);
        totalServices += osServicesTotal;
        totalCommission += (os.commissionValue || 0);
        if (!os.commissionPaid) {
          allPaid = false;
        }
      });

      if (emp.workOrders.length === 0) {
        allPaid = false; 
      }

      const mappedWorkOrders = emp.workOrders.map((os: any) => {
        const servicesValue = os.services.reduce((acc: number, s: any) => acc + (s.unitPrice * s.quantity), 0);
        return {
          ...os,
          servicesValue
        };
      });

      const { workOrders, ...rest } = emp;
      return {
        ...rest,
        totalServices,
        totalCommission,
        status: allPaid && emp.workOrders.length > 0 ? 'PAGO' : 'PENDENTE',
        workOrders: mappedWorkOrders
      };
    });
  }

  async payCommissions(month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.workOrder.updateMany({
      where: {
        status: { in: ['CONCLUIDO', 'FATURADO'] },
        exitDate: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        commissionPaid: false
      },
      data: {
        commissionPaid: true,
        commissionPaidAt: new Date()
      }
    });
  }
}
