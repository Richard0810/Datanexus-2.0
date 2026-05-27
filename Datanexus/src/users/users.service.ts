import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
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
    if (!isValidObjectId(id)) {
        return this.usersModel.findOne({ id }).exec();
    }
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
    const filter = isValidObjectId(id) ? { _id: id } : { id };
    return this.usersModel.findOneAndUpdate(filter, updateUserDto, { new: true }).exec();
  }

  async updateByFirebaseUid(firebaseUid: string, data: Partial<users>): Promise<users | null> {
    const updated = await this.usersModel.findOneAndUpdate({ firebaseUid }, data, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`User with firebaseUid ${firebaseUid} not found for update`);
    }
    return updated;
  }

  async remove(id: string): Promise<any | null> {
    const filter = isValidObjectId(id) ? { _id: id } : { id };
    return this.usersModel.findOneAndDelete(filter).exec();
  }
}