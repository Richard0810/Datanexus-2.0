import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  nivel_dificultad: number;

  @IsString()
  estado: string;

  @IsUrl()
  url: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string; // Hacemos que la imagen sea opcional al crear

  @IsNumber()
  duracion: number;
}
