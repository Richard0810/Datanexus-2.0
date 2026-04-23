import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EducationalResourcesService } from './educational_resources.service';
import { EducationalResourcesController } from './educational_resources.controller';
import { EducationalResources, EducationalResourcesSchema } from './schemas/educational_resources.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EducationalResources.name, schema: EducationalResourcesSchema },
    ]),
  ],
  controllers: [EducationalResourcesController],
  providers: [EducationalResourcesService],
})
export class EducationalResourcesModule {}
