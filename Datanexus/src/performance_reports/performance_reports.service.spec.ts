import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceReportsService } from './performance_reports.service';

describe('PerformanceReportsService', () => {
  let service: PerformanceReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceReportsService],
    }).compile();

    service = module.get<PerformanceReportsService>(PerformanceReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
