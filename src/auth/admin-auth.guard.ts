import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../schemas/users.schema';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = (context.switchToHttp().getRequest() as Request).user as User;

    if (!user) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }
  }
}
