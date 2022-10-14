import { Model, ModelObject } from 'objection';

export class Task extends Model {
    public static tableName = 'TASK';

    public id!: number;

    public description!: string;

    public duration!: number;

    public project_id!: number;

    public project_name!: string;

    public created_at!: Date;

    public deleted_at!: Date;
}

export type ITask = ModelObject<Task> | undefined;
