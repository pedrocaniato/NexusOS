import { Controller, Get, Post, Patch, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    return this.customersService.findAll(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const customer = await this.customersService.findOne(id);
    if (!customer) {
      throw new NotFoundException('Cadastro não encontrado');
    }
    return customer;
  }

  @Post()
  async create(@Body() data: any) {
    return this.customersService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.customersService.update(id, data);
  }
}
