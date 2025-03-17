import { Inject, Injectable } from '@nestjs/common'
import { HfInference } from '@huggingface/inference'
import { ConfigType } from '@nestjs/config'
import { appConfig } from 'src/core/configs/db'

@Injectable()
export class AIService {
  constructor(
    @Inject(appConfig.KEY)
    private authEnv: ConfigType<typeof appConfig>,
  ) {
    this.hf = new HfInference(this.authEnv.apiKey)
  }
  readonly hf: HfInference
}
