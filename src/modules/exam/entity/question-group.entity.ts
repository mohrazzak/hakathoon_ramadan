import { zod as z } from 'src/core/z'

export enum QuestionGroupType {
  CLASSICAL = 'CLASSICAL',
  MULTIPLE_CHOICES = 'MULTIPLE_CHOICES',
  TRUE_FALSE = 'TRUE_FALSE',
}

export const questionGroupSchema = z
  .strictObject({
    type: z.nativeEnum(QuestionGroupType),
    count: z.coerce.number().min(1).max(15),
    choicesCount: z.coerce.number().int().min(1).max(4).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === QuestionGroupType.MULTIPLE_CHOICES &&
      data.choicesCount === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'عدد الاختيارات مطلوب عندما يكون نوع الاسئلة اخر الإجابة الصحيحة.',
        path: ['choicesNumber'],
      })
    }

    if (
      data.type !== QuestionGroupType.MULTIPLE_CHOICES &&
      data.choicesCount !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'عدد الاختيارات مطلوب فقط عندما يكون نوع الاسئلة اختر الإجابة الصحيحة.',
        path: ['choicesNumber'],
      })
    }
  })

export type QuestionGroup = Zod.infer<typeof questionGroupSchema>
