import { Test, TestingModule } from '@nestjs/testing';
import { AcademicReferencesService } from './academic_references.service';

describe('AcademicReferencesService', () => {
  let service: AcademicReferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicReferencesService],
    }).compile();

    service = module.get<AcademicReferencesService>(AcademicReferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
