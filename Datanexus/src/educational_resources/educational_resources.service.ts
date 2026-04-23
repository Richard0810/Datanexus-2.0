import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEducationalResourceDto } from './dto/create-educational_resource.dto';
import { UpdateEducationalResourceDto } from './dto/update-educational_resource.dto';
import { EducationalResources, EducationalResourcesDocument } from './schemas/educational_resources.schema';

@Injectable()
export class EducationalResourcesService {
  constructor(
    @InjectModel(EducationalResources.name)
    private educationalResourceModel: Model<EducationalResourcesDocument>,
  ) {}

  async create(createEducationalResourceDto: CreateEducationalResourceDto): Promise<EducationalResources> {
    const createdEducationalResource = new this.educationalResourceModel(createEducationalResourceDto);
    const savedEducationalResource = await createdEducationalResource.save();
    return savedEducationalResource;
  }

  async findAll(): Promise<EducationalResources[]> {
    return this.educationalResourceModel.find().exec();
  }

  async findOne(id: string): Promise<EducationalResources | null> {
    return this.educationalResourceModel.findById(id).exec();
  }

  async update(id: string, updateEducationalResourceDto: UpdateEducationalResourceDto): Promise<EducationalResources | null> {
    return this.educationalResourceModel
      .findByIdAndUpdate(id, updateEducationalResourceDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.educationalResourceModel.findByIdAndDelete(id).exec();
  }
}
