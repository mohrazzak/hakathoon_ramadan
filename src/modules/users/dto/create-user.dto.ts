import { createZodDto } from 'nestjs-zod';
import { zod as z } from 'src/core/z';
import { passwordSchema, usernameSchema } from './schemas';
import { USER_STATUS } from 'src/db/enums';

export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[\p{L}\p{N}_]+$/u);

export const createUserDto = z.strictObject({
  firstName: nameSchema,

  lastName: nameSchema,

  username: usernameSchema,

  password: passwordSchema,

  status: z.nativeEnum(USER_STATUS),

  roleId: z.number().int(),
});

export class CreateUserDto extends createZodDto(createUserDto) {}
