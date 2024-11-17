import { registerAs } from '@nestjs/config';
import { EnvDBSchema, envDBSchema } from './db.schema';

export const dbConfig = registerAs('database', () => {
  const dbConfig: EnvDBSchema = {
    host: process.env.DATABASE_HOST!,
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    name: process.env.DATABASE_NAME!,
    port: process.env.DATABASE_PORT!,
  };

  const parsed = envDBSchema.parse(dbConfig);

  return parsed;
});
