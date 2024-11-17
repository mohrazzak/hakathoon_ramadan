import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../interfaces/request.interface';
import { JwtRTPayload } from '../interfaces/jwt-rt-payload.interface';

export const GetUser = createParamDecorator(
  (data: keyof JwtRTPayload, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (data) return request.user[data];
    return request.user;
  },
);
