import { Model, ModelObject } from 'objection';

export class Project extends Model {
    public static tableName = 'PROJECT';

    public id!: number;

    public name!: string;

    public user_id!: string;

    public created_at!: Date;

    public deleted_at!: Date;
}

export type IProject = ModelObject<Project> | undefined;
