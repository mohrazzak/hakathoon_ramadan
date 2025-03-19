import { createZodDto } from 'nestjs-zod'
import { zod as z } from 'src/core/z'
import { questionGroupSchema } from '../entity/question-group.entity'

export const examSchema = z.strictObject({
  questionGroups: z.array(questionGroupSchema),
  lang: z.string(),
})

export class ExamDto extends createZodDto(examSchema) {}
