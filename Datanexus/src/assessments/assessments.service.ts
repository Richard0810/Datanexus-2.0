
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { assessments, assessmentsDocument } from './schemas/assessments.schema';

@Injectable()
export class AssessmentsService {
  constructor(@InjectModel(assessments.name) private assessmentsModel: Model<assessmentsDocument>) {}

  async create(createAssessmentsDto: CreateAssessmentDto): Promise<assessments> {
    const createdAssessment = new this.assessmentsModel(createAssessmentsDto);
    return createdAssessment.save();
  }

  async findAll(): Promise<assessments[]> {
    return this.assessmentsModel.find().exec();
  }

  async findOne(id: string): Promise<assessments | null> {
    return this.assessmentsModel.findById(id).exec();
  }

  async update(id: string, updateAssessmentDto: UpdateAssessmentDto): Promise<assessments | null> {
    return this.assessmentsModel.findByIdAndUpdate(id, updateAssessmentDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.assessmentsModel.findByIdAndDelete(id).exec();
  }
}
