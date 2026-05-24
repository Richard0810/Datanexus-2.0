
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
      // Intentamos encontrar al usuario
      let user = await this.usersService.findOneByFirebaseUid(uid);

      // SOLUCIÓN DIRECTA: Si es el admin, forzamos el rol en el objeto de respuesta.
      if (isMainAdmin) {
        user.rol = 'admin';
      }
      
      return user;

    } catch (error) {
      // Si no existe, lo creamos con el rol correcto desde el principio
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
      // relanzamos cualquier otro error
      throw error;
    }
  }
}
