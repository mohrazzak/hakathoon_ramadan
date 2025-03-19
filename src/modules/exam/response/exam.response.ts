import { createZodDto } from 'nestjs-zod'
import { zod as z } from 'src/core/z'

export const examResponse = z.strictObject({
  CLASSICAL: z.array(
    z.strictObject({
      question: z.string(),
      answer: z.string(),
    }),
  ),

  TRUE_FALSE: z.array(
    z.strictObject({
      question: z.string(),
      answer: z.string(),
    }),
  ),

  MULTIPLE_CHOICES: z.array(
    z.strictObject({
      question: z.string(),
      choices: z.array(z.string()),
      answer: z.string(),
    }),
  ),
})

export class ExamResponse extends createZodDto(examResponse) {}
