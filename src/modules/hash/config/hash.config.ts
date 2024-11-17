import { registerAs } from '@nestjs/config';
import { EnvHashSchema, envHashSchema } from './hash.schema';

export const hashConfig = registerAs('hash', () => {
  const hashObject: EnvHashSchema = {
    hashSecret: process.env.HASH_SECRET!,
  };

  const parsed = envHashSchema.parse(hashObject);

  return parsed;
});
