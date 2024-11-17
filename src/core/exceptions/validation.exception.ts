import { UnprocessableEntityException } from '@nestjs/common';
import { ZodError } from 'zod';

export class ValidationException extends UnprocessableEntityException {
  constructor(error: ZodError) {
    super('خطأ في الحقول المدخلة.', { cause: error.errors });
  }
}
