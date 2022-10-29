import { ServiceBroker, Service, Errors, Context} from 'moleculer';
import { ITask, Task } from '../models/task';

export default class TaskService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);

        this.parseServiceSchema({
            name: 'task',
            actions: {
                getTasks: {
                    auth: 'required',
                    rest: 'GET /all',
                    params: {
                        filter: { type: 'string', optional: true },
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<ITask[]> {
                        return await this.getTasks(ctx.params?.filter);
                    }
                },
                getTaskById: {
                    auth: 'required',
                    rest: 'GET /:id',
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<ITask> {
                        return await this.getTaskById(ctx.params?.id);
                    }
                },
                create: {
                    auth: 'required',
                    rest: 'POST /create',
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
                    auth: 'required',
                    rest: 'PUT /edit/:id',
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
                    auth: 'required',
                    rest: 'DELETE /delete/:id',
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
                async getTasks(filter): Promise<ITask[]> {
                    if (filter) {
                        return await Task.query()
                            .select('id', 'description', 'duration', 'project_id', 'project_name')
                            .whereRaw('LOWER(description) LIKE ?', '%' + filter.toLowerCase() + '%')
                            .orderBy('created_at', 'desc')
                            .orderBy('id', 'desc')
                            .whereNull('deleted_at');
                    }
                    return await Task.query()
                        .select('id', 'description', 'duration', 'project_id', 'project_name')
                        .orderBy('created_at', 'desc')
                        .orderBy('id', 'desc')
                        .whereNull('deleted_at');
                },
                async getTaskById(taskId: string): Promise<ITask> {
                    const task = await Task.query()
                        .findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }
                    return task;
                },
                async create(taskData: ITask): Promise<ITask> {
                    const createdTask = await Task.query().insert({
                        ...taskData,
                        created_at: new Date,
                    });
                    return createdTask;
                },
                async renameTask(taskId: string, description: string): Promise<ITask> {
                    const task = await Task.query()
                        .findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }

                    const renamedTask = await task.$query()
                        .patchAndFetch({ description });
                    return renamedTask;
                },
                async delete(taskId: string): Promise<ITask> {
                    const task = await Task.query()
                        .findById(taskId);

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