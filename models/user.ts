import { Model, ModelObject } from 'objection';

export class User extends Model {
    public static tableName = 'USER';

    public id!: number;

    public email!: string;

    public password!: string;

    public token!: string;
}

export type IUser = ModelObject<User> | undefined;
