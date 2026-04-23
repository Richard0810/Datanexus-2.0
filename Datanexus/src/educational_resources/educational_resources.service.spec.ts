import { Test, TestingModule } from '@nestjs/testing';
import { EducationalResourcesService } from './educational_resources.service';

describe('EducationalResourcesService', () => {
  let service: EducationalResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducationalResourcesService],
    }).compile();

    service = module.get<EducationalResourcesService>(EducationalResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
