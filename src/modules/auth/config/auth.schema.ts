import { z } from 'zod';

export const envAuthSchema = z.strictObject({
  atSecret: z.string(),
  atDuration: z.string(),
  rtSecret: z.string(),
  rtDuration: z.string(),
  hashingSecret: z.string(),
});

export type EnvAuthSchema = z.infer<typeof envAuthSchema>;
