import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EducationalResourcesService } from './educational_resources.service';
import { CreateEducationalResourceDto } from './dto/create-educational_resource.dto';
import { UpdateEducationalResourceDto } from './dto/update-educational_resource.dto';

@Controller('educational-resources')
export class EducationalResourcesController {
  constructor(private readonly educationalResourcesService: EducationalResourcesService) {}

  @Post()
  create(@Body() createEducationalResourceDto: CreateEducationalResourceDto) {
    return this.educationalResourcesService.create(createEducationalResourceDto);
  }

  @Get()
  findAll() {
    return this.educationalResourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.educationalResourcesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEducationalResourceDto: UpdateEducationalResourceDto) {
    return this.educationalResourcesService.update(id, updateEducationalResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.educationalResourcesService.remove(id);
  }
}
