import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationalResourceDto } from './create-educational_resource.dto';

export class UpdateEducationalResourceDto extends PartialType(CreateEducationalResourceDto) {}
