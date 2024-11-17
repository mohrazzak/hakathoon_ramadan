import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './interface';
import { LoginDto } from './dto';
import { HashService } from '../hash/hash.service';
import { USER_STATUS } from 'src/db/enums';
import { UsersService } from '../users/users.service';
import { ConfigType } from '@nestjs/config';
import { authConfig } from './config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    @Inject(authConfig.KEY)
    private authEnv: ConfigType<typeof authConfig>,
  ) {}

  async getTokens(userId: number, username: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      await this.signAT(userId, username),
      await this.signRT(userId, username),
    ]);

    return { ACCESS_TOKEN: at, REFRESH_TOKEN: rt };
  }

  async signAT(userId: number, username: string) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        expiresIn: this.authEnv.atDuration,
        secret: this.authEnv.atSecret,
      },
    );
  }

  async signRT(userId: number, username: string) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        expiresIn: this.authEnv.rtDuration,
        secret: this.authEnv.rtSecret,
      },
    );
  }

  async updateRTHash(userId: number, rt: string) {
    const hashedRt = await this.hashService.hash(rt);

    const result = await this.usersService.updateRefreshToken(userId, hashedRt);

    if (Number(result.numUpdatedRows) === 0)
      throw new BadRequestException('فشل تسجيل الدخول يرجى المحاولة مرة اخرى.');
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const existingUser = await this.usersService.findByUsernameAuth(
      dto.username,
    );

    if (!existingUser)
      throw new UnauthorizedException('اسم المستخدم او كلمة المرور خاطئة.');
    if (existingUser.status === USER_STATUS.NOT_ACTIVE)
      throw new UnauthorizedException('الحساب معطل, راجع المدير التقني.');

    const passwordMatches = await this.hashService.verify(
      existingUser.password,
      dto.password,
    );

    if (!passwordMatches)
      throw new UnauthorizedException('اسم المستخدم او كلمة المرور خاطئة.');
    const tokens = await this.getTokens(existingUser.id, dto.username);
    // delay it

    await this.updateRTHash(existingUser.id, tokens.REFRESH_TOKEN);

    return tokens;
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
  }

  async refresh(userId: number, email: string): Promise<Tokens> {
    const tokens = await this.getTokens(userId, email);
    await this.updateRTHash(userId, tokens.REFRESH_TOKEN);

    return tokens;
  }
}
