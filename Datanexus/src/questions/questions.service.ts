import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { questions, questionsDocument} from './schemas/questions.schema';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(questions.name) private questionsModel: Model<questionsDocument>) {}

  async create(createquestionsDto: CreateQuestionDto): Promise<questions> {
    const createdQuestions = new this.questionsModel(createquestionsDto);
    const savedProduct = await createdQuestions.save();
    return savedProduct;
  }

  async findAll(): Promise<questions[]> {
    return this.questionsModel.find().exec();
  }

  async findOne(id: string): Promise<questions | null> {
    return this.questionsModel.findById(id).exec();
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<questions | null> {
    return this.questionsModel.findByIdAndUpdate(id, updateQuestionDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.questionsModel.findByIdAndDelete(id).exec();
  }
}
