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

  private fileToDataUri(file: any): string {
    if (!file) return null;
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
  }

  async create(createDto: CreateEducationalResourceDto, file?: any): Promise<EducationalResources> {
    const data = { ...createDto };
    
    // Si viene un archivo, lo convertimos a Data URI y lo guardamos en la URL
    if (file) {
      data.url = this.fileToDataUri(file);
      data.formato = file.originalname.split('.').pop() || 'file';
    }

    const createdEducationalResource = new this.educationalResourceModel(data);
    return await createdEducationalResource.save();
  }

  async findAll(): Promise<EducationalResources[]> {
    return this.educationalResourceModel.find().exec();
  }

  async findOne(id: string): Promise<EducationalResources | null> {
    return this.educationalResourceModel.findById(id).exec();
  }

  async update(id: string, updateDto: UpdateEducationalResourceDto, file?: any): Promise<EducationalResources | null> {
    const data = { ...updateDto };
    
    if (file) {
      data.url = this.fileToDataUri(file);
      data.formato = file.originalname.split('.').pop() || 'file';
    }

    return this.educationalResourceModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.educationalResourceModel.findByIdAndDelete(id).exec();
  }
}
