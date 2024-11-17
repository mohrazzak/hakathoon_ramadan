import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { RTGuard } from 'src/core/guards';
import { GetUser } from 'src/core/decorators/get-user.decorator';
import { GetUserId } from 'src/core/decorators/get-user-id.decorator';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
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
    return await this.authService.refresh(userId, username);
  }
}
