import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerformanceReportsService } from './performance_reports.service';
import { CreatePerformanceReportDto } from './dto/create-performance_report.dto';
import { UpdatePerformanceReportDto } from './dto/update-performance_report.dto';

@Controller('performance-reports')
export class PerformanceReportsController {
  constructor(private readonly performanceReportsService: PerformanceReportsService) {}

  @Post()
  create(@Body() createPerformanceReportDto: CreatePerformanceReportDto) {
    return this.performanceReportsService.create(createPerformanceReportDto);
  }

  @Get()
  findAll() {
    return this.performanceReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.performanceReportsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerformanceReportDto: UpdatePerformanceReportDto) {
    return this.performanceReportsService.update(id, updatePerformanceReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.performanceReportsService.remove(id);
  }
}
