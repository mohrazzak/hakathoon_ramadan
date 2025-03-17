import { Module } from '@nestjs/common'

import { AIModule } from '../ai/ai.module'
import { ExamController } from './exam.controller'
import { ExamService } from './exam.service'

@Module({
  imports: [AIModule],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}
