import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from 'src/db/types';
import { CreateUserDto, UpdateUserDto } from './dto';
import { InjectKysely } from 'nestjs-kysely';

@Injectable()
export class UsersRepository {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  async create(user: CreateUserDto) {
    await this.db
      .insertInto('User')
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password,
        roleId: user.roleId,
        status: user.status,
      })
      .executeTakeFirst();
  }

  async findAll() {
    return await this.db.selectFrom('User').selectAll().execute();
  }

  async findById(userId: number) {
    return await this.db
      .selectFrom('User')
      .where('User.id', '=', userId)
      .selectAll()
      .executeTakeFirst();
  }

  async findByIdAuth(userId: number) {
    return await this.db
      .selectFrom('User')
      .where('User.id', '=', userId)
      .select(['status', 'hashedRt'])
      .executeTakeFirst();
  }

  async findByUsername(username: string) {
    return await this.db
      .selectFrom('User')
      .where('User.username', '=', username)
      .selectAll()
      .executeTakeFirst();
  }

  async findByUsernameAuth(username: string) {
    return await this.db
      .selectFrom('User')
      .where('User.username', '=', username)
      .select(['password', 'id', 'status'])
      .executeTakeFirst();
  }

  async update(userId: number, user: UpdateUserDto) {
    return await this.db
      .updateTable('User')
      .set(user)
      .where('User.id', '=', userId)
      .executeTakeFirst();
  }

  async clearRefreshToken(userId: number) {
    return await this.db
      .updateTable('User')
      .set({ hashedRt: null })
      .where('User.id', '=', userId)
      .where('User.hashedRt', 'is not', null)
      .executeTakeFirst();
  }

  async updateRefreshToken(userId: number, rt: string) {
    return await this.db
      .updateTable('User')
      .set({ hashedRt: rt })
      .where('User.id', '=', userId)
      .executeTakeFirst();
  }

  async delete(userId: number) {
    return await this.db
      .updateTable('User')
      .set({ deletedAt: new Date() })
      .where('User.id', '=', userId)
      .executeTakeFirst();
  }
}
