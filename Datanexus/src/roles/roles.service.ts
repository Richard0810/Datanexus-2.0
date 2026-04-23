import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { roles, rolesDocument } from './schemas/roles.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(roles.name) 
    private roleModel: Model<rolesDocument>
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<roles> {
    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findAll(): Promise<roles[]> {
    return this.roleModel.find().exec();
  }

  async findOne(id: string): Promise<roles | null> {
    return this.roleModel.findById(id).exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<roles | null> {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any | null> {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
