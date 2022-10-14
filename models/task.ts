import { Model, ModelObject } from 'objection';

export class Task extends Model {
    public static tableName = 'TASK';

    public id!: number;

    public description!: string;

    public project_id!: number;

    public project_name!: string;
}

export type ITask = ModelObject<Task> | undefined;
