import { Module } from '@nestjs/common';
import { AcademicReferencesService } from './academic_references.service';
import { AcademicReferencesController } from './academic_references.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { academic_references, academic_referencesSchema } from './schemas/academic_references.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: academic_references.name, schema: academic_referencesSchema }])],
  controllers: [AcademicReferencesController],
  providers: [AcademicReferencesService],
})
export class AcademicReferencesModule {}
