import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../interfaces/request.interface';

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user.sub;
  },
);
