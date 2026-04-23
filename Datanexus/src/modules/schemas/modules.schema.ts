
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type modulesDocument = HydratedDocument<modules>;

@Schema()
export class modules {
  @Prop()
  id: string;

  @Prop()
  estado: string;

  @Prop()
  nivel_dificultad: number;

  @Prop()
  titulo: string;

  @Prop()
 descripcion: string;

  @Prop()
  url: string;

  @Prop()
  duracion: number;

}

export const modulesSchema = SchemaFactory.createForClass(modules);