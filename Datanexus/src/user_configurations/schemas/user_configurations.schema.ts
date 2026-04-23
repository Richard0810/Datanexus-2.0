import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserConfigurationsDocument = UserConfigurations & Document;

@Schema()
export class UserConfigurations {
  @Prop()
  id: string;

  @Prop()
  idioma: string;

  @Prop()
  nivel_dificultad: string;
}

export const UserConfigurationsSchema = SchemaFactory.createForClass(UserConfigurations);