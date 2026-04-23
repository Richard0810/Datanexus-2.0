import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserConfigurationsService } from './user_configurations.service';
import { CreateUserConfigurationDto } from './dto/create-user_configuration.dto';
import { UpdateUserConfigurationDto } from './dto/update-user_configuration.dto';

@Controller('user-configurations')
export class UserConfigurationsController {
  constructor(private readonly userConfigurationsService: UserConfigurationsService) {}

  @Post()
  create(@Body() createUserConfigurationDto: CreateUserConfigurationDto) {
    return this.userConfigurationsService.create(createUserConfigurationDto);
  }

  @Get()
  findAll() {
    return this.userConfigurationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userConfigurationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserConfigurationDto: UpdateUserConfigurationDto) {
    return this.userConfigurationsService.update(id, updateUserConfigurationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userConfigurationsService.remove(id);
  }
}
