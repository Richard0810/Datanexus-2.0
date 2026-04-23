
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type questionsDocument = HydratedDocument<questions>;

@Schema()
export class questions {
  @Prop()
  id: string;

  @Prop()
  tipo: string;

  @Prop()
  comparacion: number;

  @Prop()
  resultados_esperados: string;

  @Prop()
  preguntas_generadas: string;

  @Prop()
  poblacion: string;

}

export const questionsSchema = SchemaFactory.createForClass(questions);
