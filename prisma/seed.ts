import { Kysely, PostgresDialect } from 'kysely';
import { DB } from '../src/db/types';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

const dialect = new PostgresDialect({
  pool: new Pool({
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    port: +process.env.DATABASE_PORT!,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});

const hashSecret = process.env.HASH_SECRET!;
async function main() {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom('User').execute();
    await trx.deleteFrom('Role').execute();

    const roles = await trx
      .insertInto('Role')
      .values([{ name: 'admin' }, { name: 'user' }])
      .returning('id')
      .execute();

    return await trx
      .insertInto('User')
      .values([
        {
          firstName: 'فادي',
          lastName: 'ابو دان',
          username: 'admin',
          password: await argon2.hash('Hmode1422', {
            secret: Buffer.from(hashSecret),
          }),
          roleId: roles[0].id,
        },
        {
          firstName: 'محمد',
          lastName: 'عبد الرزاق',
          username: 'user',
          password: await argon2.hash('Hmode1422', {
            secret: Buffer.from(hashSecret),
          }),
          roleId: roles[1].id,
        },
      ])
      .execute();
  });
}
main()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (e) => {
    console.error(e);
    await db.destroy();
    process.exit(1);
  });
