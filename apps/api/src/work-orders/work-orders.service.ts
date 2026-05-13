import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrder, Prisma, OSStatus } from '@prisma/client';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  /** Normaliza string para o padrão do enum OSStatus (sem acentos, uppercase) */
  private normalizeStatus(raw: string): OSStatus {
    const normalized = raw
      .normalize('NFD')                   // decompõe acentos: ç → c + cedilla
      .replace(/[\u0300-\u036f]/g, '')     // remove os diacríticos
      .toUpperCase()                       // tudo maiúsculo
      .trim();
    
    // Validação extra para garantir que o status normalizado existe no Enum
    if (!Object.values(OSStatus).includes(normalized as OSStatus)) {
      throw new BadRequestException(`Status inválido: ${raw}`);
    }

    return normalized as OSStatus;
  }

  async findAll(status?: string): Promise<any[]> {
    console.log('--- FILTRO DE OS ---', { 
      recebido: status, 
      normalizado: status ? this.normalizeStatus(status) : 'SEM FILTRO' 
    });

    const whereClause: Prisma.WorkOrderWhereInput = status
      ? { status: this.normalizeStatus(status) }
      : {};
    
    return this.prisma.workOrder.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { name: true },
        },
        products: {
          include: { product: true },
        },
        services: {
          include: { service: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number): Promise<any> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: {
          select: {
            name: true,
            email: true,
          },
        },
        equipmentRef: true,
        products: {
          include: {
            product: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    return workOrder;
  }

  async create(data: Prisma.WorkOrderCreateInput): Promise<WorkOrder> {
    return this.prisma.$transaction(async (tx) => {
      // Intercept data to handle employeeId correctly
      const inputData = data as any;
      const empId = inputData.employeeId;
      delete inputData.employeeId;

      if (empId) {
        inputData.employee = { connect: { id: empId } };
      }

      // 1. Criar a Ordem de Serviço primeiro para obter o ID
      const workOrder = await tx.workOrder.create({
        data: {
          ...inputData,
          status: 'ENTRADA',
        },
      });

      // 2. Gerar a tag automática: ETQ-{id_da_os}
      const tag = `ETQ-${workOrder.id}`;

      // Extrair customerId de forma segura
      const customerId = (data.customer as any)?.connect?.id;
      
      let equipment;

      // 3. Regra de Duplicidade por Serial Number
      if (data.serialNumber) {
        const existingEquipment = await tx.equipment.findFirst({
          where: { serialNumber: data.serialNumber },
        });

        if (existingEquipment) {
          // Atualiza o equipamento existente, anexando-o à nova OS e garantindo vínculo com cliente
          equipment = await tx.equipment.update({
            where: { id: existingEquipment.id },
            data: {
              name: data.equipment,
              brandModel: data.brandModel,
              tag: tag, // Atualiza a tag para controle de bancada atual
              customerId: customerId, 
            },
          });
        } else {
          // Cria novo equipamento
          equipment = await tx.equipment.create({
            data: {
              name: data.equipment,
              brandModel: data.brandModel,
              serialNumber: data.serialNumber,
              tag: tag,
              customerId: customerId,
            },
          });
        }
      } else {
        // Sem serial number: cria um novo registro sempre
        equipment = await tx.equipment.create({
          data: {
            name: data.equipment,
            brandModel: data.brandModel,
            tag: tag,
            customerId: customerId,
          },
        });
      }

      // 4. Vincular o equipamento criado/encontrado à OS e retornar a OS atualizada
      return tx.workOrder.update({
        where: { id: workOrder.id },
        data: {
          equipmentId: equipment.id,
        },
        include: {
          customer: { select: { name: true } },
          equipmentRef: true
        }
      });
    });
  }

  async update(id: number, data: Prisma.WorkOrderUpdateInput): Promise<WorkOrder> {
    const existingOs = await this.findOne(id);

    // Ajuste: Normaliza o status antes de processar as regras de negócio
    if (data.status && typeof data.status === 'string') {
      data.status = this.normalizeStatus(data.status);
    }

    // Regra: Não retroceder OS Concluída
    if (
      existingOs.status === 'CONCLUIDO' &&
      data.status &&
      ['ENTRADA', 'ORCAMENTO', 'ABERTO', 'ANDAMENTO'].includes(data.status as string)
    ) {
      throw new BadRequestException('Não é possível retroceder uma OS Concluída.');
    }

    // Baixa automática de estoque ao mudar para ANDAMENTO
    if (data.status === 'ANDAMENTO' && existingOs.status !== 'ANDAMENTO') {
      const items = await this.prisma.workOrderProduct.findMany({
        where: { workOrderId: id },
      });

      for (const item of items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await this.prisma.stockMovement.create({
          data: {
            type: 'SAIDA',
            quantity: item.quantity,
            description: `Baixa automática - OS #${id}`,
            productId: item.productId,
          },
        });
      }
    }

    // Cálculo Automático de Comissão no Fechamento
    // data.status pode ser string ou { set: string } no Prisma update input
    const newStatusStr = typeof data.status === 'object' && data.status?.set ? data.status.set : data.status;
    const isClosing = newStatusStr === 'CONCLUIDO';
    const wasNotClosed = existingOs.status !== 'CONCLUIDO';

    if (isClosing && wasNotClosed) {
      // Extrair employeeId do input (pode ser set, ou direto, ou connect)
      let targetEmployeeId = existingOs.employeeId;
      const updateData = data as any;
      
      if (typeof updateData.employeeId === 'number') {
        targetEmployeeId = updateData.employeeId;
      } else if (typeof updateData.employeeId === 'object' && updateData.employeeId?.set) {
        targetEmployeeId = updateData.employeeId.set;
      } else if (updateData.employee?.connect?.id) {
        targetEmployeeId = updateData.employee.connect.id;
      }

      if (targetEmployeeId) {
        const employee = await this.prisma.employee.findUnique({
          where: { id: targetEmployeeId },
        });

        if (employee) {
          const services = await this.prisma.workOrderService.findMany({
            where: { workOrderId: id },
          });
          const totalServices = services.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
          data.commissionValue = totalServices * (employee.commissionRate / 100);
        }
      }
      
      if (!data.exitDate) {
        data.exitDate = new Date();
      }
    }

    return this.prisma.workOrder.update({
      where: { id },
      data,
    });
  }

  async addProduct(workOrderId: number, productId: string, quantity: number): Promise<any> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    await this.prisma.workOrderProduct.create({
      data: {
        workOrderId,
        productId,
        quantity,
        unitPrice: product.price,
      },
    });

    return this.recalculateTotal(workOrderId);
  }

  async removeProduct(workOrderId: number, itemId: string): Promise<any> {
    await this.prisma.workOrderProduct.delete({ where: { id: itemId } });
    return this.recalculateTotal(workOrderId);
  }

  async addService(workOrderId: number, serviceId: string, quantity: number): Promise<any> {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    await this.prisma.workOrderService.create({
      data: {
        workOrderId,
        serviceId,
        quantity,
        unitPrice: service.price,
      },
    });

    return this.recalculateTotal(workOrderId);
  }

  async removeService(workOrderId: number, itemId: string): Promise<any> {
    await this.prisma.workOrderService.delete({ where: { id: itemId } });
    return this.recalculateTotal(workOrderId);
  }

  async recalculateTotal(workOrderId: number): Promise<WorkOrder> {
    const products = await this.prisma.workOrderProduct.findMany({
      where: { workOrderId },
    });
    
    const services = await this.prisma.workOrderService.findMany({
      where: { workOrderId },
    });

    const totalProducts = products.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const totalServices = services.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { totalValue: totalProducts + totalServices },
    });
  }

  async invoice(id: number): Promise<WorkOrder> {
    const workOrder = await this.findOne(id);

    if (workOrder.status !== 'CONCLUIDO') {
      throw new BadRequestException('Apenas ordens de serviço concluídas podem ser faturadas.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Atualiza status da OS
      const updatedOs = await tx.workOrder.update({
        where: { id },
        data: { status: 'FATURADO' },
      });

      // 2. Cria registro financeiro (Contas a Receber)
      await tx.payment.create({
        data: {
          description: `Recebimento - OS #${id}`,
          amount: workOrder.totalValue,
          dueDate: new Date(),
          status: 'PENDENTE',
          workOrderId: id,
        },
      });

      return updatedOs;
    });
  }

  async remove(id: number): Promise<WorkOrder> {
    await this.findOne(id);
    return this.prisma.workOrder.delete({
      where: { id },
    });
  }
}