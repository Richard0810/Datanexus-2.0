
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';;
import { CreatePrismaModelDto } from './dto/create-prisma_model.dto';
import { UpdatePrismaModelDto } from './dto/update-prisma_model.dto';
import { prisma_models, prisma_modelsDocument } from './schemas/prisma_models.schema';



@Injectable()
export class PrismaModelsService {
  constructor(@InjectModel(prisma_models.name) private productModel: Model<prisma_modelsDocument>) {}

  async create(createPrismaModelsDto: CreatePrismaModelDto): Promise<prisma_models> {
    const createdProduct = new this.productModel(createPrismaModelsDto);
    const savedProduct = await createdProduct.save();
    return savedProduct;
  }

  async findAll(): Promise<prisma_models[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<prisma_models | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdatePrismaModelDto): Promise<prisma_models | null> {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
