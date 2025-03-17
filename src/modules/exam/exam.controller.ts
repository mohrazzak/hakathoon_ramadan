import { Body, Controller, Post } from '@nestjs/common'
import { ExamDto } from './dto/generate.dto'
import { ExamService } from './exam.service'

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  generateExam(@Body() examDto: ExamDto) {
    return this.examService.generateExam(examDto)
  }
}
