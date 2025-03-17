import { z } from 'zod'

export const envAppSchema = z.strictObject({
  port: z.string(),
  apiKey: z.string(),
})

export type EnvAppSchema = z.infer<typeof envAppSchema>
