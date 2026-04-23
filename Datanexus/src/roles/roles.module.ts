import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { roles, rolesSchema } from './schemas/roles.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: roles.name, schema: rolesSchema }])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
