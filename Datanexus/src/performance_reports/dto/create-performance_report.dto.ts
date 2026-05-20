import { ApiProperty } from '@nestjs/swagger';

export class CreatePerformanceReportDto {
  @ApiProperty()
  usuarioNombre: string;

  @ApiProperty()
  usuarioEmail: string;

  @ApiProperty()
  tipoEnvio: string;

  @ApiProperty()
  moduloId: string;

  @ApiProperty()
  tituloContenido: string;

  @ApiProperty()
  detalleEnvio: string;

  @Prop()
  puntaje?: number;

  @ApiProperty()
  estado?: string;
}
