import { registerAs } from '@nestjs/config';
import { EnvAuthSchema, envAuthSchema } from './auth.schema';

export const authConfig = registerAs('auth', () => {
  const authObject: EnvAuthSchema = {
    atSecret: process.env.ACCESS_TOKEN_SECRET!,
    atDuration: process.env.ACCESS_TOKEN_DURATION!,
    rtSecret: process.env.REFRESH_TOKEN_SECRET!,
    rtDuration: process.env.REFRESH_TOKEN_DURATION!,
    hashingSecret: process.env.HASH_SECRET!,
  };

  const parsed = envAuthSchema.parse(authObject);

  return parsed;
});
