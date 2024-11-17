import { zod as z } from 'src/core/z';

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(16)
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: 'اسم المستخدم يجب ان يحوي على احرف انجليزية فقط.',
  })
  .transform((val) => val.toLowerCase());
