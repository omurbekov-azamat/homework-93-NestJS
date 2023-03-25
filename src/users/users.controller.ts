import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  async login(@Req() req: Request) {
    return req.user as UserDocument;
  }
}
