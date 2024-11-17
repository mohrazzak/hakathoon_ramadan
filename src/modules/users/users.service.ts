import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersRepository } from './users.repository';
import { HashService } from '../hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
  ) {}

  async registerUser(dto: CreateUserDto) {
    const { password, ...body } = dto;
    const hash = await this.hashService.hash(password);

    await this.usersRepository.create({ ...body, password: hash });
  }

  async findAll() {
    return await this.usersRepository.findAll();
  }

  async findById(userId: number) {
    return await this.usersRepository.findById(userId);
  }

  async findByIdAuth(userId: number) {
    return await this.usersRepository.findByIdAuth(userId);
  }

  async findByUsername(username: string) {
    return await this.usersRepository.findByUsername(username);
  }

  async findByUsernameAuth(username: string) {
    return await this.usersRepository.findByUsernameAuth(username);
  }

  async update(userId: number, user: UpdateUserDto) {
    const password = user.password
      ? await this.hashService.hash(user.password)
      : undefined;
    return await this.usersRepository.update(userId, { ...user, password });
  }

  async updateRefreshToken(userId: number, rt: string) {
    return await this.usersRepository.updateRefreshToken(userId, rt);
  }

  async clearRefreshToken(userId: number) {
    await this.usersRepository.clearRefreshToken(userId);
  }

  async delete(userId: number) {
    return await this.usersRepository.delete(userId);
  }
}
