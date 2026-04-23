import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceReportsController } from './performance_reports.controller';
import { PerformanceReportsService } from './performance_reports.service';

describe('PerformanceReportsController', () => {
  let controller: PerformanceReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceReportsController],
      providers: [PerformanceReportsService],
    }).compile();

    controller = module.get<PerformanceReportsController>(PerformanceReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
