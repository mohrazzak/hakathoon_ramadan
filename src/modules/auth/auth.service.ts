import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './interface';
import { LoginDto, SignupDto } from './dto';
import { HashService } from '../hash/hash.service';
import { USER_STATUS } from 'src/db/enums';
import { UsersService } from '../users/users.service';
import { ConfigType } from '@nestjs/config';
import { authConfig } from './config/auth.config';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    @Inject(authConfig.KEY)
    private authEnv: ConfigType<typeof authConfig>,
    private readonly usersRepository: UsersRepository
  ) {}

  async getTokens(userId: number, username: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      await this.signAT(userId, username),
      await this.signRT(userId, username),
    ]);

    return { accessToken: at, refreshToken: rt };
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
      throw new BadRequestException('اسم المستخدم او كلمة المرور خاطئة.');
    if (existingUser.status === USER_STATUS.NOT_ACTIVE)
      throw new BadRequestException('الحساب معطل, راجع المدير التقني.');

    const passwordMatches = await this.hashService.verify(
      existingUser.password,
      dto.password,
    );

    if (!passwordMatches)
      throw new BadRequestException('اسم المستخدم او كلمة المرور خاطئة.');
    const tokens = await this.getTokens(existingUser.id, dto.username);
    // delay it

    await this.updateRTHash(existingUser.id, tokens.refreshToken);

    return tokens;
  }


  async signup(dto: SignupDto) {
    const { password, ...body } = dto;
    const hash = await this.hashService.hash(password);

    await this.usersRepository.create({ ...body, password: hash });
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
  }

  async refresh(userId: number, username: string): Promise<string> {
    return await this.signAT(userId, username);
  }
}
