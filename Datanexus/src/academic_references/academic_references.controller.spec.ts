import { Test, TestingModule } from '@nestjs/testing';
import { AcademicReferencesController } from './academic_references.controller';
import { AcademicReferencesService } from './academic_references.service';
import { getModelToken } from '@nestjs/mongoose';
import { AcademicReferences } from './schemas/academic_references.schema';

describe('AcademicReferencesController', () => {
  let controller: AcademicReferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicReferencesController],
      providers: [
        AcademicReferencesService,
        {
          provide: getModelToken(AcademicReferences.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AcademicReferencesController>(AcademicReferencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
