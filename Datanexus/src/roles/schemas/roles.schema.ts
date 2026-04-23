
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type rolesDocument = HydratedDocument<roles>;

@Schema()
export class roles {
  @Prop()
  id: string;

  @Prop()
  nombre: string;

  @Prop()
  descripcion: string;

}

export const rolesSchema = SchemaFactory.createForClass(roles);
