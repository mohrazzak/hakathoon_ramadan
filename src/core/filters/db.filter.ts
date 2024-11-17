import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { PostgresErrorMapper } from '../utils/error-mapper.util';

@Catch(DatabaseError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: DatabaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const code = exception.code || HttpStatus.INTERNAL_SERVER_ERROR.toString();
    const msg = exception.detail || exception.message;
    const { statusCode, message } = PostgresErrorMapper.mapError(code, msg);

    console.error('Database Exception:', msg);

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
