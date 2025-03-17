import { registerAs } from '@nestjs/config'
import { envAppSchema, EnvAppSchema } from './db.schema'

export const appConfig = registerAs('app', () => {
  const dbConfig: EnvAppSchema = {
    apiKey: process.env.API_KEY!,
    port: process.env.PORT!,
  }
  console.log(dbConfig)

  const parsed = envAppSchema.parse(dbConfig)

  return parsed
})
