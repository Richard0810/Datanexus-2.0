import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PerformanceReportsDocument = HydratedDocument<PerformanceReports>;

@Schema({ timestamps: true })
export class PerformanceReports {
  @Prop()
  usuarioNombre: string;

  @Prop()
  usuarioEmail: string;

  @Prop()
  tipoEnvio: string; // 'actividad' | 'evaluacion'

  @Prop()
  moduloId: string;

  @Prop()
  tituloContenido: string;

  @Prop()
  detalleEnvio: string; // JSON string con respuestas o texto de entrega

  @Prop()
  puntaje: number;

  @Prop()
  recomendaciones: string;

  @Prop()
  estado: string; // 'enviado' | 'calificado' | 'completado'
}

export const PerformanceReportsSchema = SchemaFactory.createForClass(PerformanceReports);
