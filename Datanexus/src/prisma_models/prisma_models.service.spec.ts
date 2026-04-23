import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModelsService } from './prisma_models.service';

describe('PrismaModelsService', () => {
  let service: PrismaModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaModelsService],
    }).compile();

    service = module.get<PrismaModelsService>(PrismaModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
