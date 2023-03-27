import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { Request } from 'express';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;

    const token = request.get('Authorization');

    if (!token) {
      return false;
    }

    const user = await this.userModel.findOne({ token });

    if (!user) {
      return false;
    }

    request.user = user;

    return true;
  }
}
