import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { appConfig } from 'src/core/configs/db'
import { OpenAI } from 'openai'

@Injectable()
export class AIService {
  readonly deepseek: OpenAI

  constructor(
    @Inject(appConfig.KEY)
    private authEnv: ConfigType<typeof appConfig>,
  ) {
    this.deepseek = new OpenAI({
      apiKey: this.authEnv.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
}
