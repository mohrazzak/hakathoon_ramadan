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
      secretOrKey: authEnv.atSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtRTPayload> {
    const rt = req.get('refresh-token')?.replace('Bearer', '').trim();

    if (!rt)
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );

    const user = await this.usersService.findByIdAuth(payload.sub);

    if (!user || !user.hashedRt || user.status === USER_STATUS.NOT_ACTIVE)
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );

    const rtMatches = await this.hashService.verify(user.hashedRt, rt);
    if (!rtMatches)
      throw new UnauthorizedException(
        'لايمكن تجديد الجلسة, سجل الدخول مرة اخرى',
      );

    return { ...payload, rt };
  }
}
