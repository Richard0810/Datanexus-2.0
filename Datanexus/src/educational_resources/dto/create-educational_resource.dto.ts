
import { ApiProperty } from '@nestjs/swagger';

export class CreateEducationalResourceDto {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  formato: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  unidad: string;
}
