import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RTGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req.headers['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('هناك خلل في الجلسة.');
    }
    req.headers.authorization = refreshToken;
    return req;
  }
}
