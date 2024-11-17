import { z } from 'zod';

export const envHashSchema = z.strictObject({
  hashSecret: z.string(),
});

export type EnvHashSchema = z.infer<typeof envHashSchema>;
