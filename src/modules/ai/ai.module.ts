import { Module } from '@nestjs/common'
import { AIService } from './ai.service'
import { ConfigModule } from '@nestjs/config'
import { appConfig } from 'src/core/configs/db'

@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
