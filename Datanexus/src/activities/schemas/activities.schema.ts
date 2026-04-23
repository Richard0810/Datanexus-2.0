import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type activitiesDocument = HydratedDocument<activities>;

@Schema()
export class activities {
  @Prop()
  id: string;

  @Prop()
  tipo: string;

  @Prop()
  descripcion: string;

  @Prop()
  criterios_evaluacion: string;

}
export const activitiesSchema = SchemaFactory.createForClass(activities);