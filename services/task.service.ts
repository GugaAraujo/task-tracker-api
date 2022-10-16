import { ServiceBroker, Service, Errors, Context} from 'moleculer';
import { ITask, Task } from '../models/task';

export default class TaskService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);

        this.parseServiceSchema({
            name: 'task',
            actions: {
                getTasks: {
                    rest: {
                        method: 'GET',
                        path: '/'
                    },
                    async handler(): Promise<ITask[]> {
                        return await this.getTasks();
                    }
                },
                getTaskById: {
                    rest: {
                        method: 'GET',
                        path: '/:id',
                    },
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<ITask> {
                        return await this.getTaskById(ctx.params?.id);
                    }
                },
                getProjectNameCount: {
                    rest: {
                        method: 'GET',
                        path: '/count/project'
                    },
                    async handler(): Promise<any[]> {
                        return await this.getProjectNameCount();
                    }
                },
                create: {
                    rest: {
                        method: 'POST',
                        path: '/'
                    },
                    params: {
                        description: 'string',
                        duration: 'number',
                        project_id: 'number',
                        project_name: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<ITask> {
                        return await this.create(ctx.params);
                    }
                },
                renameTask: {
                    rest: {
                        method: 'PUT',
                        path: '/:id',
                    },
                    params: {
                        id: 'string',
                        description: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<ITask> {
                        return await this.renameTask(ctx.params?.id, ctx.params?.description);
                    }
                },
                delete: {
                    rest: {
                        method: 'DELETE',
                        path: '/:id',
                    },
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<ITask> {
                        return await this.delete(ctx.params?.id);
                    }
                },
            },
            methods: {
                async getTasks(): Promise<ITask[]> {
                    return await Task.query().where('deleted_at', null);
                },
                async getTaskById(taskId: string): Promise<ITask> {
                    const task = await Task.query().findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }
                    return task;
                },
                async getProjectNameCount(): Promise<any[]> {
                    return await Task.query().select('project_name').where('deleted_at', null).groupBy('project_name').count('project_name', { as: 'quantity' });
                },
                async create(taskData: ITask): Promise<ITask> {
                    const createdTask = await Task.query().insert({
                        ...taskData,
                        created_at: new Date,
                    });
                    return createdTask;
                },
                async renameTask(taskId: string, description: string): Promise<ITask> {
                    const task = await Task.query().findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }

                    const renamedTask = await task.$query().patchAndFetch({description});
                    return renamedTask;
                },
                async delete(taskId: string): Promise<ITask> {
                    const task = await Task.query().findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }

                    const deletedTask = await task.$query()
                        .patchAndFetch({
                            deleted_at: new Date,
                        });
                    return deletedTask;
                },
            }
        })
    }
}