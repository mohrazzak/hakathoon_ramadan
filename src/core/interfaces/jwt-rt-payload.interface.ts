import { JwtPayload } from './jwt-payload.interface';

export interface JwtRTPayload extends JwtPayload {
  rt?: string;
}
