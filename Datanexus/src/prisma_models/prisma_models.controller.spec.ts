import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModelsController } from './prisma_models.controller';
import { PrismaModelsService } from './prisma_models.service';
import { getModelToken } from '@nestjs/mongoose';
import { PrismaModels } from './schemas/prisma_models.schema';

describe('PrismaModelsController', () => {
  let controller: PrismaModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrismaModelsController],
      providers: [
        PrismaModelsService,
        {
          provide: getModelToken(PrismaModels.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PrismaModelsController>(PrismaModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
