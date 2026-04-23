import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';

@Controller('searches')
export class SearchesController {
  constructor(private readonly searchesService: SearchesService) {}

  @Post()
  create(@Body() createSearchDto: CreateSearchDto) {
    return this.searchesService.create(createSearchDto);
  }

  @Get()
  findAll() {
    return this.searchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSearchDto: UpdateSearchDto) {
    return this.searchesService.update(id, updateSearchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.searchesService.remove(id);
  }
}
