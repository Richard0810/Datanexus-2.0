
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { modules, modulesDocument } from './schemas/modules.schema';

@Injectable()
export class ModulesService {
  constructor(@InjectModel(modules.name) private productModel: Model<modulesDocument>) {}

  async create(createModulesDto: CreateModuleDto): Promise<modules> {
    const createdProduct = new this.productModel(createModulesDto);
    const savedProduct = await createdProduct.save();
    return savedProduct;
  }

  async findAll(): Promise<modules[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<modules | null> {
    return this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateModuleDto): Promise<modules | null> {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
