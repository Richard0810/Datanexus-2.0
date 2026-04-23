import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type searchesDocument = HydratedDocument<searches>;

@Schema()
export class searches {
  @Prop()
  id: string;

  @Prop()
  palabras_claves: string;

  @Prop()
  operadores: string;

  @Prop()
  filtros: string;

  @Prop()
  resultados_relacionados: string;

  @Prop()
  fecha_hora: string;

  @Prop()
  uso_ia: string;

  @Prop()
  resultados_obtenidos: string; 

}

export const searchesSchema = SchemaFactory.createForClass(searches);