import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
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
      // Intentamos encontrar al usuario por su UID de Firebase
      let user = await this.usersService.findOneByFirebaseUid(uid);

      // FORZAR ROL DE ADMIN: Asegurar persistencia del rol en MongoDB
      if (isMainAdmin && user.rol !== 'admin') {
        // Usamos el UID de firebase para actualizar el rol en la DB de forma segura
        const updatedUser = await this.usersService.updateByFirebaseUid(uid, { rol: 'admin' });
        if (updatedUser) {
          user = updatedUser;
        }
      }
      
      return user;

    } catch (error) {
      // Si el error es porque el usuario no fue encontrado (404), lo creamos.
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