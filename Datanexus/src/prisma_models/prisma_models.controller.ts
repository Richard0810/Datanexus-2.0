import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrismaModelsService } from './prisma_models.service';
import { CreatePrismaModelDto } from './dto/create-prisma_model.dto';
import { UpdatePrismaModelDto } from './dto/update-prisma_model.dto';

@Controller('prisma-models')
export class PrismaModelsController {
  constructor(private readonly prismaModelsService: PrismaModelsService) {}

  @Post()
  create(@Body() createPrismaModelDto: CreatePrismaModelDto) {
    return this.prismaModelsService.create(createPrismaModelDto);
  }

  @Get()
  findAll() {
    return this.prismaModelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prismaModelsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrismaModelDto: UpdatePrismaModelDto) {
    return this.prismaModelsService.update(id, updatePrismaModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaModelsService.remove(id);
  }
}
