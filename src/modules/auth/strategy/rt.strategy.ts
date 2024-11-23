import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/core/interfaces/jwt-payload.interface';
import { JwtRTPayload } from 'src/core/interfaces/jwt-rt-payload.interface';
import { USER_STATUS } from 'src/db/enums';
import { HashService } from 'src/modules/hash/hash.service';
import { UsersService } from 'src/modules/users/users.service';
import { authConfig } from '../config/auth.config';

@Injectable()
export class RTStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    @Inject(authConfig.KEY)
    private readonly authEnv: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authEnv.rtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtRTPayload> {
    // Extract the Authorization header
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );
    }

    // Extract the bearer token from the header
    const bearerToken = Array.isArray(authHeader)
      ? authHeader[authHeader.length - 1]
      : authHeader;

    if (!bearerToken.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );
    }

    const token = bearerToken.slice(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );
    }

    // Find the user associated with the payload
    const user = await this.usersService.findByIdAuth(payload.sub);

    if (!user || !user.hashedRt || user.status === USER_STATUS.NOT_ACTIVE) {
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );
    }

    // Verify the token against the stored hash
    const rtMatches = await this.hashService.verify(user.hashedRt, token);

    if (!rtMatches) {
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );
    }

    // Return the validated payload with the token
    return { ...payload, rt: token };
  }
}
