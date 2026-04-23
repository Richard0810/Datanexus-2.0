import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // <-- Importar UsersModule

@Module({
  imports: [UsersModule], // <-- Añadir UsersModule a los imports
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
