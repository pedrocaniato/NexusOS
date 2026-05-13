import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Res, Query } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { PdfService } from '../pdf/pdf.service';
import type { Response } from 'express';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly pdfService: PdfService
  ) {}

  @Get(':id/pdf')
  async generatePdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const os = await this.workOrdersService.findOne(id);
    const buffer = await this.pdfService.generateWorkOrderPdf(os);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=OS_${os.id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.workOrdersService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workOrdersService.findOne(id); 
  }

  @Post()
  create(@Body() data: any) {
    const { customerId, ...rest } = data;
    return this.workOrdersService.create({
      ...rest,
      customer: { connect: { id: customerId } },
    });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.workOrdersService.update(id, data);
  }

  @Patch(':id/invoice')
  invoice(@Param('id', ParseIntPipe) id: number) {
    return this.workOrdersService.invoice(id);
  }

  // Produtos Utilizados
  @Post(':id/products')
  addProduct(@Param('id', ParseIntPipe) id: number, @Body() body: { productId: string, quantity: number }) {
    return this.workOrdersService.addProduct(id, body.productId, body.quantity);
  }

  @Delete(':id/products/:itemId')
  removeProduct(@Param('id', ParseIntPipe) id: number, @Param('itemId') itemId: string) {
    return this.workOrdersService.removeProduct(id, itemId);
  }

  // Serviços Prestados
  @Post(':id/services')
  addService(@Param('id', ParseIntPipe) id: number, @Body() body: { serviceId: string, quantity: number }) {
    return this.workOrdersService.addService(id, body.serviceId, body.quantity);
  }

  @Delete(':id/services/:itemId')
  removeService(@Param('id', ParseIntPipe) id: number, @Param('itemId') itemId: string) {
    return this.workOrdersService.removeService(id, itemId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workOrdersService.remove(id);
  }
}
