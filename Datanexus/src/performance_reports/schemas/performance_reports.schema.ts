import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PerformanceReportsDocument = HydratedDocument<PerformanceReports>;

@Schema()
export class PerformanceReports {
  @Prop()
  id: string;

  @Prop()
  periodo: string;

  @Prop()
  modulo_evaluado: string;

  @Prop()
  atividades_completadas: string;

  @Prop()
  recomendaciones: string;

  @Prop()
  puntaje: number;

  @Prop()
  tiempo_invertido: number;
}

export const PerformanceReportsSchema = SchemaFactory.createForClass(PerformanceReports);
