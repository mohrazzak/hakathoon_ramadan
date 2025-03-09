import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { KyselyModule } from 'nestjs-kysely';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationExceptionFilter } from './core/filters/validation.filter';
import { MyZodValidationPipe } from './core/pipes/validation.pipe';
import { NoResultDBExceptionFilter } from './core/filters/no-result-db.filter';
import { DatabaseExceptionFilter } from './core/filters/db.filter';
import { HashModule } from './modules/hash/hash.module';
import { ATGuard } from './core/guards';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { dbConfig } from './core';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      // expandVariables: true,
    }),
    KyselyModule.forRootAsync({
      imports: [ConfigModule.forFeature(dbConfig)],
      inject: [dbConfig.KEY],
      useFactory: (configuration: ConfigType<typeof dbConfig>) => {
        return {
          dialect: new PostgresDialect({
            pool: new Pool({
              host: configuration.host,
              port: +configuration.port,
              database: configuration.name,
              user: configuration.username,
              password: configuration.password,
              ssl: true,
            }),
          }),
        };
      },
    }),
    UsersModule,

    AuthModule,

    HashModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ATGuard,
    },
    {
      provide: APP_PIPE,
      useClass: MyZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NoResultDBExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
})
export class AppModule {}
