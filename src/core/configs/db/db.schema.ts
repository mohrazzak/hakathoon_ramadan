import { z } from 'zod';

export const envDBSchema = z.strictObject({
  host: z.string(),
  port: z.string(),
  username: z.string(),
  password: z.string(),
  name: z.string(),
});

export type EnvDBSchema = z.infer<typeof envDBSchema>;
