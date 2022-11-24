import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return 'createUser';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get('me')
  getMyProfile() {
    return 'getMyProfile';
  }

  @Put('me')
  updateMyProfile(@Body() updateUserDto: UpdateUserDto) {
    return 'updateMyProfile';
  }

  @Patch('me/like/:id')
  likeUser(@Param('id') id: string) {
    return 'likeUser';
  }
}
