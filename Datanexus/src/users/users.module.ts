import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { users, usersSchema } from './schemas/users.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: users.name, schema: usersSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // <-- Añadido para exportar el servicio
})
export class UsersModule {}
