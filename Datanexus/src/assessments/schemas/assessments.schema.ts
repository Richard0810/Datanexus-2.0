import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type assessmentsDocument = HydratedDocument<assessments>;

@Schema()
export class assessments {
  @Prop()
  id: string;

  @Prop()
  retroalimentacion: string;

  @Prop()
  puntuacion: string;

  @Prop()
  criterios_evaluacion: string;

}

export const assessmentsSchema = SchemaFactory.createForClass(assessments);