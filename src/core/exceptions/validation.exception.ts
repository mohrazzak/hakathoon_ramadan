import { UnprocessableEntityException } from '@nestjs/common';
import { ZodError } from 'zod';

export class ValidationException extends UnprocessableEntityException {
  constructor(error: ZodError) {
    super(error.errors[0].message, { cause: error.errors });
  }
}
