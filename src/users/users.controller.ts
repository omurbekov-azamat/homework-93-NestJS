import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', { dest: './public/uploads/avatars' }),
  )
  async registerUser(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = new this.userModel({
      username: req.body.username,
      password: req.body.password,
      displayName: req.body.displayName,
      avatar: file ? '/uploads/avatars/' + file.filename : null,
    });

    user.generateToken();

    return user.save();
  }
}
