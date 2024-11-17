import { Request } from 'express';
import { JwtRTPayload } from './jwt-rt-payload.interface';

export interface AuthRequest extends Request {
  user: JwtRTPayload;
}
