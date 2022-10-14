import { Model, ModelObject } from 'objection';

export class Project extends Model {
    public static tableName = 'PROJECT';

    public id!: number;

    public name!: string;

    public deleted_at!: Date;
}

export type IProject = ModelObject<Project> | undefined;
