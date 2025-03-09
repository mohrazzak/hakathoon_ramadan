import { createZodDto } from 'nestjs-zod';
import { zod as z } from 'src/core/z';
import { USER_STATUS } from 'src/db/enums';
import { passwordSchema, usernameSchema } from 'src/modules/users/dto';

export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[\p{L}\p{N}_]+$/u);

export const signupDto = z.strictObject({
  firstName: nameSchema,

  lastName: nameSchema,

  username: usernameSchema,

  password: passwordSchema,

  // status: z.nativeEnum(USER_STATUS),

  // roleId: z.number().int(),
});

export class SignupDto extends createZodDto(signupDto) { }
