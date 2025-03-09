import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { USER_STATUS } from "./enums";

export type Role = {
    id: Generated<number>;
    name: string;
};
export type User = {
    id: Generated<number>;
    firstName: string;
    lastName: string;
    status: Generated<USER_STATUS>;
    username: string;
    password: string;
    hashedRt: string | null;
    roleId: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp | null;
    deletedAt: Timestamp | null;
};
export type DB = {
    Role: Role;
    User: User;
};
