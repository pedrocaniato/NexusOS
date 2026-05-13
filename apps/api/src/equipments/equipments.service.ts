import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.equipment.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { tag: { contains: search } },
          { brandModel: { contains: search } },
          { serialNumber: { contains: search } },
          { customer: { name: { contains: search } } },
        ],
      } : {},
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          }
        },
        workOrders: {
          select: { status: true },
          orderBy: { id: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.equipment.findUnique({
      where: { id },
      include: {
        customer: true,
        workOrders: {
          orderBy: { entryDate: 'desc' }
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.equipment.update({
      where: { id },
      data: {
        brandModel: data.brandModel,
        serialNumber: data.serialNumber,
        observations: data.observations,
      },
    });
  }
}
