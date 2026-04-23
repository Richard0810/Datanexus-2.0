import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { activities, activitiesSchema } from './schemas/activities.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: activities.name, schema: activitiesSchema }])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
