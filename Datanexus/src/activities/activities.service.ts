
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { activities, activitiesDocument } from './schemas/activities.schema';

@Injectable()
export class ActivitiesService {
  constructor(@InjectModel(activities.name) private productModel: Model<activitiesDocument>) {}

  async create(createActivitiesDto: CreateActivityDto): Promise<activities> {
    const createdProduct = new this.productModel(createActivitiesDto);
    const savedProduct = await createdProduct.save();
    return savedProduct;
  }

  async findAll(): Promise<activities[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<activities | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateActivityDto): Promise<activities | null> {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
