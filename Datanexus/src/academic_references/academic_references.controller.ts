import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AcademicReferencesService } from './academic_references.service';
import { CreateAcademicReferenceDto } from './dto/create-academic_reference.dto';
import { UpdateAcademicReferenceDto } from './dto/update-academic_reference.dto';

@Controller('academic-references')
export class AcademicReferencesController {
  constructor(private readonly academicReferencesService: AcademicReferencesService) {}

  @Post()
  create(@Body() createAcademicReferenceDto: CreateAcademicReferenceDto) {
    return this.academicReferencesService.create(createAcademicReferenceDto);
  }

  @Get()
  findAll() {
    return this.academicReferencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicReferencesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcademicReferenceDto: UpdateAcademicReferenceDto) {
    return this.academicReferencesService.update(id, updateAcademicReferenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicReferencesService.remove(id);
  }
}
