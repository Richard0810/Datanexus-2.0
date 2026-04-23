
import { Controller, Post, Body, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Assuming you have a UsersService

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sync')
  async syncUser(@Body('token') token: string) {
    const decodedToken = await this.authService.verifyToken(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const { uid, email, name } = decodedToken;

    try {
      // Check if user already exists
      let user = await this.usersService.findOneByFirebaseUid(uid);
      return user; // User exists, return their data
    } catch (error) {
        // NestJS throws an error if findOne fails, which is what we want for a new user.
        // We will create the user now.
        console.log(`User with UID ${uid} not found. Creating new user.`);
    }
    
    // Create user if they don't exist
    const newUser = await this.usersService.create({
        firebaseUid: uid,
        email,
        // Use the name from the token, or a default if not available
        nombre: name || 'New User',
        rol: 'estudiante', // Default role
    });

    return newUser;
  }
}
