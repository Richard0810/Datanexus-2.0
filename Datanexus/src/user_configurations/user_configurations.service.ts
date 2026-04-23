import { Injectable } from '@nestjs/common';
import { CreateUserConfigurationDto } from './dto/create-user_configuration.dto';
import { UpdateUserConfigurationDto } from './dto/update-user_configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserConfigurations, UserConfigurationsDocument } from './schemas/user_configurations.schema';

@Injectable()
export class UserConfigurationsService {
  constructor(
    @InjectModel(UserConfigurations.name) 
    private userConfigurationModel: Model<UserConfigurationsDocument>
  ) {}

  async create(createUserConfigurationDto: CreateUserConfigurationDto): Promise<UserConfigurations> {
    const createdUserConfiguration = new this.userConfigurationModel(createUserConfigurationDto);
    return createdUserConfiguration.save();
  }

  async findAll(): Promise<UserConfigurations[]> {
    return this.userConfigurationModel.find().exec();
  }

  async findOne(id: string): Promise<UserConfigurations | null> {
    return this.userConfigurationModel.findById(id).exec();
  }

  async update(id: string, updateUserConfigurationDto: UpdateUserConfigurationDto): Promise<UserConfigurations | null> {
    return this.userConfigurationModel.findByIdAndUpdate(id, updateUserConfigurationDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.userConfigurationModel.findByIdAndDelete(id).exec();
  }
}
