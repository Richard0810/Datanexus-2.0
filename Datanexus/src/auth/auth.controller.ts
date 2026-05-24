
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

      // FORZAR ROL DE ADMIN: Si el usuario es el admin principal, nos aseguramos de que su rol sea 'admin'.
      if (isMainAdmin && user.rol !== 'admin') {
        const userId = user.id || (user as any)._id.toString();
        // Actualizamos el rol en la base de datos
        const updatedUser = await this.usersService.update(userId, { rol: 'admin' });
        
        if (updatedUser) {
          // Si la actualización fue exitosa, usamos el usuario actualizado.
          user = updatedUser;
        } else {
          // Si por alguna razón la actualización falla, no continuamos con datos incorrectos.
           console.error(`Failed to update admin role for user ${email}`);
           // Opcional: podrías lanzar un error si prefieres que la operación falle completamente.
           // throw new InternalServerErrorException('Failed to update admin role.');
        }
      }
      
      return user;

    } catch (error) {
      // Si el error es porque el usuario no fue encontrado, lo creamos.
      if (error.status === 404) {
        const newUser = await this.usersService.create({
          firebaseUid: uid,
          email: email || '',
          nombre: finalName,
          // Asignamos el rol correcto desde el principio
          rol: isMainAdmin ? 'admin' : 'estudiante',
          progreso: 0,
          idioma: 'es'
        });
        return newUser;
      }
      // Si es otro tipo de error, lo lanzamos.
      throw error;
    }
  }
}
