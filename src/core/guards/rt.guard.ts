import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

export class RTGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
  getRequest(context: ExecutionContext): Request {
    const req = context.switchToHttp().getRequest<Request>();
    const refreshToken = req.cookies['refreshToken'];
    console.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('هناك خلل في الجلسة.');
    }
    req.headers.authorization = `Bearer ${refreshToken}`;
    return req;
  }
}
