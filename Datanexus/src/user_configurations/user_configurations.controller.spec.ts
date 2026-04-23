import { Test, TestingModule } from '@nestjs/testing';
import { UserConfigurationsController } from './user_configurations.controller';
import { UserConfigurationsService } from './user_configurations.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserConfigurations } from './schemas/user_configurations.schema';

describe('UserConfigurationsController', () => {
  let controller: UserConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserConfigurationsController],
      providers: [
        UserConfigurationsService,
        {
          provide: getModelToken(UserConfigurations.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserConfigurationsController>(UserConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
