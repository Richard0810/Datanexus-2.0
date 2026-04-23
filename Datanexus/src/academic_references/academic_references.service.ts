import { Injectable } from '@nestjs/common';
import { CreateAcademicReferenceDto } from './dto/create-academic_reference.dto';
import { UpdateAcademicReferenceDto } from './dto/update-academic_reference.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { academic_references, academic_referencesDocument } from './schemas/academic_references.schema';

@Injectable()
export class AcademicReferencesService {
  constructor(@InjectModel(academic_references.name) private academicReferenceModel: Model<academic_referencesDocument>) {}

  async create(createAcademicReferenceDto: CreateAcademicReferenceDto): Promise<academic_references> {
    const createdAcademicReference = new this.academicReferenceModel(createAcademicReferenceDto);
    return createdAcademicReference.save();
  }

  async findAll(): Promise<academic_references[]> {
    return this.academicReferenceModel.find().exec();
  }

  async findOne(id: string): Promise<academic_references | null> {
    return this.academicReferenceModel.findById(id).exec();
  }

  async update(id: string, updateAcademicReferenceDto: UpdateAcademicReferenceDto): Promise<academic_references | null> {
    return this.academicReferenceModel.findByIdAndUpdate(id, updateAcademicReferenceDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.academicReferenceModel.findByIdAndDelete(id).exec();
  }
}
