import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type academic_referencesDocument = HydratedDocument<academic_references>;

@Schema()
export class academic_references {
  @Prop()
  id: string;

  @Prop()
  titulo: string;

  @Prop()
  autores: string;

  @Prop()
  año_publicacion: string

  @Prop()
  fuente: string;

  @Prop()
  url: string;

  @Prop()
  tipo: string;

  @Prop()
  estado: string;

  @Prop()
  formato_citacion: string;
  
}

export const academic_referencesSchema = SchemaFactory.createForClass(academic_references);