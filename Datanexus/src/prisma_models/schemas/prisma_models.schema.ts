import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type prisma_modelsDocument = HydratedDocument<prisma_models>;

@Schema()
export class prisma_models {
  @Prop()
  id: string;

  @Prop()
  criterios_aplicados: string;

  @Prop()
  observaciones: string;

  @Prop()
  diagramas_generados: string;

  @Prop()
  fase: string;

  @Prop()
  numero_articulos: number;

}

export const prisma_modelsSchema = SchemaFactory.createForClass(prisma_models);