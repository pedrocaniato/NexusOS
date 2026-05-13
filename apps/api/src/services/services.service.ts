import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Service, Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return this.prisma.service.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    const service = await this.findOne(id);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Service> {
    const service = await this.findOne(id);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
