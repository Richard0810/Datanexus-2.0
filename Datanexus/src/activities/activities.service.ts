import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { activities, activitiesDocument } from './schemas/activities.schema';

@Injectable()
export class ActivitiesService {
  constructor(@InjectModel(activities.name) private activityModel: Model<activitiesDocument>) {}

  async create(createActivitiesDto: CreateActivityDto): Promise<activities> {
    const createdActivity = new this.activityModel(createActivitiesDto);
    return await createdActivity.save();
  }

  async findAll(): Promise<activities[]> {
    return this.activityModel.find().exec();
  }

  async findOne(id: string): Promise<activities | null> {
    return this.activityModel.findById(id).exec();
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<activities | null> {
    return this.activityModel.findByIdAndUpdate(id, updateActivityDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.activityModel.findByIdAndDelete(id).exec();
  }
}