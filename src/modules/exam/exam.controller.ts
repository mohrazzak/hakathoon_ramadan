import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ExamDto } from './dto/generate.dto'
import { ExamService } from './exam.service'
import { FilesInterceptor } from '@nestjs/platform-express'
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async generateExam(
    @Body() examDto: ExamDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.examService.generateExam(examDto, files)
  }
}
