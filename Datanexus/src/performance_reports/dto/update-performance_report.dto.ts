import { PartialType } from '@nestjs/swagger';
import { CreatePerformanceReportDto } from './create-performance_report.dto';

export class UpdatePerformanceReportDto extends PartialType(CreatePerformanceReportDto) {}
