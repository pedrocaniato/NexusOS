import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Customer, Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(contactType?: string): Promise<Customer[]> {
    const whereClause: Prisma.CustomerWhereInput = contactType
      ? { contactType: contactType as any }
      : {};

    return this.prisma.customer.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    if (data.document) {
      const existing = await this.prisma.customer.findFirst({
        where: { document: data.document },
      });

      if (existing) {
        throw new BadRequestException('Já existe um cadastro com este documento.');
      }
    }

    return this.prisma.customer.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    const customer = await this.findOne(id);
    if (!customer) {
      throw new NotFoundException('Cadastro não encontrado.');
    }

    if (data.document && typeof data.document === 'string') {
      const existing = await this.prisma.customer.findFirst({
        where: { 
          document: data.document,
          id: { not: id } // Ignora o próprio registro na validação de unicidade
        },
      });

      if (existing) {
        throw new BadRequestException('Já existe OUTRO cadastro com este documento.');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }
}
