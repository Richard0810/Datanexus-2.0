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
    const finalName = nameFromClient || name || 'New User';

    try {
      // Intentamos buscar al usuario por su UID de Firebase
      let user = await this.usersService.findOneByFirebaseUid(uid);
      
      // Si el usuario existe pero tiene el nombre por defecto, lo actualizamos
      if (user.nombre === 'New User' && finalName !== 'New User') {
        const updatedUser = await this.usersService.update(user.id || (user as any)._id.toString(), { nombre: finalName });
        return updatedUser || user;
      }
      
      return user;
    } catch (error) {
      // Si no existe (NotFoundException), lo creamos
      const newUser = await this.usersService.create({
        firebaseUid: uid,
        email: email || '',
        nombre: finalName,
        rol: 'estudiante',
        progreso: 0,
        idioma: 'es'
      });
      return newUser;
    }
  }
}
