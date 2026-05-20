
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
      let user = await this.usersService.findOneByFirebaseUid(uid);
      
      // Normalizamos el rol de la base de datos para comparar
      const currentRole = (user.rol || '').trim().toLowerCase();

      // Si es el admin principal pero no tiene el rol 'admin' normalizado, lo forzamos
      if (isMainAdmin && currentRole !== 'admin' && currentRole !== 'administrador') {
        const updatedUser = await this.usersService.update(user.id || (user as any)._id.toString(), { rol: 'admin' });
        return updatedUser || user;
      }
      
      // Actualizamos el nombre si era el por defecto
      if (user.nombre === 'New User' && finalName !== 'New User') {
        const updatedUser = await this.usersService.update(user.id || (user as any)._id.toString(), { nombre: finalName });
        return updatedUser || user;
      }
      
      return user;
    } catch (error) {
      // Si no existe, lo creamos
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
  }
}
