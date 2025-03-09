import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
import { RTGuard } from 'src/core/guards';
import { GetUser } from 'src/core/decorators/get-user.decorator';
import { GetUserId } from 'src/core/decorators/get-user-id.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  async signup(@Body() body: SignupDto) {
    await this.authService.signup(body);
  }

  @Public()
  @Post('/login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: LoginDto,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: 'lax',
      path: '/',
      priority: 'high',
    });
    return { accessToken };
  }

  @Post('/logout')
  async logout(@GetUserId() userId: number) {
    await this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RTGuard)
  @Post('/refresh')
  async refresh(
    @GetUserId() userId: number,
    @GetUser('username') username: string,
  ) {
    const accessToken = await this.authService.refresh(userId, username);

    return { accessToken };
  }
}
