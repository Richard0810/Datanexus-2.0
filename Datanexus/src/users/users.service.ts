import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { users, usersDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(users.name) private usersModel: Model<usersDocument>) {}

  async create(createUserDto: any): Promise<users> {
    const createdUser = new this.usersModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<users[]> {
    return this.usersModel.find().exec();
  }

  async findOne(id: string): Promise<users | null> {
    return this.usersModel.findById(id).exec();
  }
  
  async findOneByFirebaseUid(firebaseUid: string): Promise<users> {
    const user = await this.usersModel.findOne({ firebaseUid }).exec();
    if (!user) {
      throw new NotFoundException(`User with firebaseUid ${firebaseUid} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<users | null> {
    return this.usersModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async updateByFirebaseUid(firebaseUid: string, data: Partial<users>): Promise<users | null> {
    return this.usersModel.findOneAndUpdate({ firebaseUid }, data, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.usersModel.findByIdAndDelete(id).exec();
  }
}
