import { Model, ModelObject } from 'objection';

export class User extends Model {
    public static tableName = 'USER';

    public id!: number;

    public username!: string;

    public email!: string;

    public password!: string;

    public token!: string;

    public first_access!: boolean;
}

export type IUser = ModelObject<User> | undefined;
