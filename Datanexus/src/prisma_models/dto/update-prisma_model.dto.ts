import { PartialType } from '@nestjs/mapped-types';
import { CreatePrismaModelDto } from './create-prisma_model.dto';

export class UpdatePrismaModelDto extends PartialType(CreatePrismaModelDto) {}
