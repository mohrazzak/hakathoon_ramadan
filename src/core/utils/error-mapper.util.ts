import { PostgresError } from 'pg-error-enum';

export interface MappedError {
  statusCode: number;
  message: string;
}

export class PostgresErrorMapper {
  static mapError(code: string, detail: string): MappedError {
    switch (code) {
      case PostgresError.UNIQUE_VIOLATION:
        return this.handleUniqueViolation(detail);

      case PostgresError.FOREIGN_KEY_VIOLATION:
        return {
          statusCode: 400,
          message:
            'يرجى التأكد من أن القيمة المدخلة ترتبط بجدول آخر بشكل صحيح.',
        };

      case PostgresError.CHECK_VIOLATION:
        return {
          statusCode: 400,
          message: 'البيانات المدخلة لا تتوافق مع القواعد المحددة.',
        };

      case PostgresError.NOT_NULL_VIOLATION:
        return {
          statusCode: 400,
          message: 'هناك حقول مطلوبة لم يتم ملؤها.',
        };

      default:
        return {
          statusCode: 500,
          message: 'حدث خطأ غير متوقع في قاعدة البيانات أثناء معالجة الطلب.',
        };
    }
  }

  private static handleUniqueViolation(detail: string): MappedError {
    if (detail.includes('username')) {
      return {
        statusCode: 409,
        message: 'اسم المستخدم موجود مسبقاً.',
      };
    }

    if (detail.includes('firstName') && detail.includes('lastName')) {
      return {
        statusCode: 409,
        message: 'الاسم الأول والكنية موجودان مسبقاً.',
      };
    }

    return {
      statusCode: 409,
      message: 'القيمة المدخلة يجب أن تكون فريدة.',
    };
  }
}
