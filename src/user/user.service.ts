import { Model } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    const result = await newUser.save();

    return result as UserDocument;
  }

  async getOneUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).populate('liked_users');

    if (!user) {
      throw new NotFoundException(`Can't find user ${userId}`);
    }

    return user;
  }

  async getAllUser(): Promise<User[]> {
    const allUser = await this.userModel.find().exec();

    if (!allUser) {
      throw new NotFoundException(`Can't find`);
    }

    return allUser;
  }

  async isUser(intra_id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ intra_id });
    if (!user) {
      return null;
    }
    return user;
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    userId: string,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { ...updateUserDto, isRegisterDone: true },
      { new: true },
    );

    return updatedUser;
  }

  async updateProfileImage(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.getOneUser(userId);
    user.image_url = updateProfileDto.image_url;

    await user.save();

    return { message: `${user.nickname} 의 profile-image 변경 성공` };
  }

  async changeLikeUser(targetId: string, userId: string, like: boolean) {
    if (targetId === userId) {
      throw new BadRequestException();
    }
    const user = await this.getOneUser(userId);
    const targetUser = await this.getOneUser(targetId);

    if (!user || !targetUser) {
      throw new BadRequestException();
    }

    try {
      if (like) {
        await user
          .updateOne({ $addToSet: { liked_users: targetUser.id } })
          .exec();
      } else {
        await user.updateOne({ $pull: { liked_users: targetUser.id } }).exec();
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `${user?.nickname} 의 likedUsers 에 ${targetUser?.nickname} 추가 실패`,
      );
    }

    return {
      message: `${user.nickname} 의 likedUsers 에 ${targetUser.nickname} 추가 성공 `,
    };
  }

  async logoutUser(userId: string) {
    const user = await this.getOneUser(userId);

    user.rt = null;
    await user.save();

    return 'logout success';
  }
}
