import { Module } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ValidationExceptionFilter } from './core/filters/validation.filter'
import { MyZodValidationPipe } from './core/pipes/validation.pipe'
import { ConfigModule } from '@nestjs/config'
import { ExamModule } from './modules/exam/exam.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      // expandVariables: true,
    }),
    ExamModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: MyZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
