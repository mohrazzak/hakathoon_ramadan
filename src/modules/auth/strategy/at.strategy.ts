import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/core/interfaces/jwt-payload.interface';
import { USER_STATUS } from 'src/db/enums';
import { UsersService } from 'src/modules/users/users.service';
import { authConfig } from '../config/auth.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class ATStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    @Inject(authConfig.KEY)
    authEnv: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authEnv.atSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByIdAuth(payload.sub);

    if (!user || !user.hashedRt || user.status === USER_STATUS.NOT_ACTIVE)
      throw new UnauthorizedException('يرجى محاولة تسجيل الدخول مرة اخرى');

    return payload;
  }
}
