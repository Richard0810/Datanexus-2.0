
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sync')
  async syncUser(@Body('token') token: string, @Body('name') nameFromClient?: string) {
    const decodedToken = await this.authService.verifyToken(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const { uid, email, name } = decodedToken;
    const adminEmail = 'richardai200308@gmail.com';
    const finalName = nameFromClient || name || 'New User';
    const isMainAdmin = email === adminEmail;

    try {
      // Buscamos al usuario existente
      let user = await this.usersService.findOneByFirebaseUid(uid);

      // Si es el administrador principal pero su rol en DB no es admin, lo corregimos inmediatamente
      if (isMainAdmin && user.rol !== 'admin') {
        user = await this.usersService.updateByFirebaseUid(uid, { rol: 'admin' });
      }
      
      // Devolvemos el usuario (NestJS serializará el objeto Mongoose correctamente)
      return user;

    } catch (error) {
      // Si el usuario no existe (error 404), lo creamos
      if (error.status === 404) {
        const newUser = await this.usersService.create({
          firebaseUid: uid,
          email: email || '',
          nombre: finalName,
          rol: isMainAdmin ? 'admin' : 'estudiante',
          progreso: 0,
          idioma: 'es'
        });
        return newUser;
      }
      throw error;
    }
  }
}
