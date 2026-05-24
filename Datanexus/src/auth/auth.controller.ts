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
    const isMainAdmin = email === adminEmail;
    const finalName = nameFromClient || name || 'Usuario';

    try {
      // Buscamos al usuario existente en MongoDB
      let user = await this.usersService.findOneByFirebaseUid(uid);

      // CORRECCIÓN CRÍTICA: Si es el admin pero su rol no es 'admin', lo forzamos ahora mismo
      if (isMainAdmin && user.rol !== 'admin') {
        user = await this.usersService.updateByFirebaseUid(uid, { rol: 'admin' });
        console.log(`Rol de administrador forzado para: ${email}`);
      }
      
      return user;

    } catch (error) {
      // Si el usuario no existe (error 404), lo creamos con el rol correcto
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
