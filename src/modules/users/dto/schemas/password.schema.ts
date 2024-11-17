import { zod as z } from 'src/core/z';

export const passwordSchema = z.string().min(8).max(16);
