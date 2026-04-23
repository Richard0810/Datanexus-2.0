import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePerformanceReportDto } from './dto/create-performance_report.dto';
import { UpdatePerformanceReportDto } from './dto/update-performance_report.dto';
import { PerformanceReports, PerformanceReportsDocument } from './schemas/performance_reports.schema';

@Injectable()
export class PerformanceReportsService {
  constructor(
    @InjectModel(PerformanceReports.name)
    private performanceReportsModel: Model<PerformanceReportsDocument>,
  ) {}

  async create(createPerformanceReportDto: CreatePerformanceReportDto): Promise<PerformanceReports> {
    const createdReport = new this.performanceReportsModel(createPerformanceReportDto);
    return createdReport.save();
  }

  async findAll(): Promise<PerformanceReports[]> {
    return this.performanceReportsModel.find().exec();
  }

  async findOne(id: string): Promise<PerformanceReports | null> {
    return this.performanceReportsModel.findById(id).exec();
  }

  async update(id: string, updatePerformanceReportDto: UpdatePerformanceReportDto): Promise<PerformanceReports | null> {
    return this.performanceReportsModel.findByIdAndUpdate(id, updatePerformanceReportDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.performanceReportsModel.findByIdAndDelete(id).exec();
  }
}
