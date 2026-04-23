import { Module } from '@nestjs/common';
import { UserConfigurationsService } from './user_configurations.service';
import { UserConfigurationsController } from './user_configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserConfigurations, UserConfigurationsSchema } from './schemas/user_configurations.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserConfigurations.name, schema: UserConfigurationsSchema }])],
  controllers: [UserConfigurationsController],
  providers: [UserConfigurationsService],
})
export class UserConfigurationsModule {}
