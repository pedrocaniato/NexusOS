import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { deleted: false },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    const product = await this.prisma.product.create({
      data,
    });

    if (product.stock > 0) {
      await this.prisma.stockMovement.create({
        data: {
          type: 'ENTRADA',
          quantity: product.stock,
          description: 'Ajuste de Estoque Inicial',
          productId: product.id,
        },
      });
    }

    return product;
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException('Produto/Serviço não encontrado.');
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Product> {
    const product = await this.findOne(id);
    if (!product || product.deleted) {
      throw new NotFoundException('Produto/Serviço não encontrado.');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
