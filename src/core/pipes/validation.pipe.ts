import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';
import { ValidationException } from '../exceptions/validation.exception';

export const MyZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    return new ValidationException(error);
  },
});
