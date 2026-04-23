import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicReferenceDto } from './create-academic_reference.dto';

export class UpdateAcademicReferenceDto extends PartialType(CreateAcademicReferenceDto) {}
