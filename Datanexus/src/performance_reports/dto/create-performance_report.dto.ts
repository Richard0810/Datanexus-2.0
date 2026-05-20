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

  @ApiProperty({ required: false })
  puntaje?: number;

  @ApiProperty({ required: false })
  estado?: string;

  @ApiProperty({ required: false })
  recomendaciones?: string;
}
