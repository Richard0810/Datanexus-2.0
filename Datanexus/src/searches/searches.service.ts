
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { searches,searchesDocument } from './schemas/searches.schema';

@Injectable()
export class SearchesService {
  constructor(@InjectModel(searches.name) private searchesModel: Model<searchesDocument>) {}

  async create(createSearchesDto: CreateSearchDto): Promise<searches> {
    const createdSearch = new this.searchesModel(createSearchesDto);
    return createdSearch.save();
  }

  async findAll(): Promise<searches[]> {
    return this.searchesModel.find().exec();
  }

  async findOne(id: string): Promise<searches | null> {
    return this.searchesModel.findById(id).exec();
  }

  async update(id: string, updateSearchDto: UpdateSearchDto): Promise<searches | null> {
    return this.searchesModel.findByIdAndUpdate(id, updateSearchDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.searchesModel.findByIdAndDelete(id).exec();
  }
}
