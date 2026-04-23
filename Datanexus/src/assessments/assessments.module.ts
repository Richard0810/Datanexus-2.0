import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { assessments, assessmentsSchema } from './schemas/assessments.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: assessments.name, schema: assessmentsSchema }])],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
})
export class AssessmentsModule {}
