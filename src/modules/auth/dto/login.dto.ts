import { createZodDto } from 'nestjs-zod';
import { zod as z } from 'src/core/z';
import { passwordSchema, usernameSchema } from 'src/modules/users/dto';

export const loginDto = z.strictObject({
  username: usernameSchema,

  password: passwordSchema,
});

export class LoginDto extends createZodDto(loginDto) {}
