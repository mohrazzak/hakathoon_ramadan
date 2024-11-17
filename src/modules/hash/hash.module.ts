import { Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { ConfigModule } from '@nestjs/config';
import { hashConfig } from './config/hash.config';

@Module({
  imports: [ConfigModule.forFeature(hashConfig)],
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
