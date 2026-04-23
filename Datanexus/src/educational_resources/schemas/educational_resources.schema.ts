
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EducationalResourcesDocument = HydratedDocument<EducationalResources>;

@Schema()
export class EducationalResources {
  @Prop()
  id: string;

  @Prop()
  tipo: string;

  @Prop()
  titulo: string;

  @Prop()
  descripcion: string;

  @Prop()
  formato: string;

  @Prop()
  url: string;
}

export const EducationalResourcesSchema = SchemaFactory.createForClass(EducationalResources);
