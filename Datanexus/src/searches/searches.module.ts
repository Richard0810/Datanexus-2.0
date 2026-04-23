import { Module } from '@nestjs/common';
import { SearchesService } from './searches.service';
import { SearchesController } from './searches.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { searches, searchesSchema } from './schemas/searches.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: searches.name, schema: searchesSchema }])],
  controllers: [SearchesController],
  providers: [SearchesService],
})
export class SearchesModule {}
