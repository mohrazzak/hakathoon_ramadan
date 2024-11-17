import { Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { ConfigType } from '@nestjs/config';
import { hashConfig } from './config/hash.config';

@Injectable()
export class HashService {
  constructor(
    @Inject(hashConfig.KEY)
    private readonly hashEnv: ConfigType<typeof hashConfig>,
  ) {}
  private secret = Buffer.from(this.hashEnv.hashSecret);

  async hash(text: string) {
    return await argon2.hash(text, {
      type: argon2.argon2i,
      secret: this.secret,
    });
  }

  async verify(hash: string, text: string) {
    return await argon2.verify(hash, text, { secret: this.secret });
  }
}
