import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { NoResultError } from 'kysely';

const tablesTranslation = {
  Asset: 'أساس',
  User: 'مستخدم',
  Role: 'وظيفة',
};

@Catch(NoResultError)
export class NoResultDBExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let msg: string = 'لم يتم العثور على المطلوب.';
    const tableNameAr = tablesTranslation[
      exception.node.from.froms[0].table.identifier.name
    ] as string;

    msg = tableNameAr ? `لم يتم العثور على هذا ال${tableNameAr}.` : msg;

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: msg,
    });
  }
}
