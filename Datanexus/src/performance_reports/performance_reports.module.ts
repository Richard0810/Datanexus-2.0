import { Module } from '@nestjs/common';
import { PerformanceReportsService } from './performance_reports.service';
import { PerformanceReportsController } from './performance_reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceReports, PerformanceReportsSchema } from './schemas/performance_reports.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PerformanceReports.name, schema: PerformanceReportsSchema },
    ]),
  ],
  controllers: [PerformanceReportsController],
  providers: [PerformanceReportsService],
})
export class PerformanceReportsModule {}
