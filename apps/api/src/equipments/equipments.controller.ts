import { Controller, Get, Query, Param, Patch, Body } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get()
  findAll(@Query('search') search: string) {
    return this.equipmentsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.equipmentsService.update(id, data);
  }
}
