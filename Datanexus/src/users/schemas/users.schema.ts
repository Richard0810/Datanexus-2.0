
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type usersDocument = HydratedDocument<users>;

@Schema()
export class users {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop()
  id: string;

  @Prop()
  progreso: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, default: 'estudiante' })
  rol: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  idioma: string;

}

export const usersSchema = SchemaFactory.createForClass(users);
