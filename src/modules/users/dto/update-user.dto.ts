import { createZodDto } from 'nestjs-zod';
import { createUserDto } from './create-user.dto';

export const updateUserDto = createUserDto.partial();

export class UpdateUserDto extends createZodDto(updateUserDto) {}
