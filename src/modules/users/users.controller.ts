import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Public } from 'src/core';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async registerUser(@Body() body: CreateUserDto) {
    await this.usersService.registerUser(body);
  }

  @Get('/me')
  async findMe() {
    return { firstName: 'Mohammad' };
  }
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/:userId')
  async findById(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.findById(userId);
  }

  @Patch('/:userId')
  async update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserDto,
  ) {
    return await this.usersService.update(userId, body);
  }

  @Delete('/:userId')
  async delete(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.delete(userId);
  }
}
