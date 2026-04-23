import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { modules, modulesSchema } from './schemas/modules.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: modules.name, schema: modulesSchema }])],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
