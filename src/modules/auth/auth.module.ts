import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ATStrategy, RTStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { HashModule } from '../hash/hash.module';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule,
    UsersModule,
    HashModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ATStrategy, RTStrategy],
  exports: [AuthService, ATStrategy],
})
export class AuthModule {}
