import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EducationalResourcesService } from './educational_resources.service';
import { CreateEducationalResourceDto } from './dto/create-educational_resource.dto';
import { UpdateEducationalResourceDto } from './dto/update-educational_resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('educational-resources')
export class EducationalResourcesController {
  constructor(private readonly educationalResourcesService: EducationalResourcesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createEducationalResourceDto: CreateEducationalResourceDto,
    @UploadedFile() file?: any,
  ) {
    return this.educationalResourcesService.create(createEducationalResourceDto, file);
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
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string, 
    @Body() updateEducationalResourceDto: UpdateEducationalResourceDto,
    @UploadedFile() file?: any,
  ) {
    return this.educationalResourcesService.update(id, updateEducationalResourceDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.educationalResourcesService.remove(id);
  }
}
