import { Module } from '@nestjs/common';
import { PrismaModelsService } from './prisma_models.service';
import { PrismaModelsController } from './prisma_models.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { prisma_models, prisma_modelsSchema } from './schemas/prisma_models.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: prisma_models.name, schema: prisma_modelsSchema }])],
  controllers: [PrismaModelsController],
  providers: [PrismaModelsService],
})
export class PrismaModelsModule {}
