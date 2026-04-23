import { Test, TestingModule } from '@nestjs/testing';
import { EducationalResourcesController } from './educational_resources.controller';
import { EducationalResourcesService } from './educational_resources.service';
import { getModelToken } from '@nestjs/mongoose';
import { EducationalResources } from './schemas/educational_resources.schema';

describe('EducationalResourcesController', () => {
  let controller: EducationalResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationalResourcesController],
      providers: [
        EducationalResourcesService,
        {
          provide: getModelToken(EducationalResources.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<EducationalResourcesController>(EducationalResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
