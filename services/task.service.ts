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
                        return await this.getTasks(ctx.meta.user?.id, ctx.params?.filter);
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
                        return await this.getTaskById(ctx.meta.user?.id, ctx.params?.id);
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
                        return await this.create(ctx.params, ctx);
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
                        return await this.renameTask(ctx.meta.user?.id, ctx.params?.id, ctx.params?.description);
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
                        return await this.delete(ctx.meta.user?.id, ctx.params?.id);
                    }
                },
            },
            methods: {
                async getTasks(userId, filter): Promise<ITask[]> {
                    if (filter) {
                        return await Task.query()
                            .select('id', 'description', 'duration', 'project_id', 'project_name', 'user_id')
                            .whereRaw('LOWER(description) LIKE ?', '%' + filter.toLowerCase() + '%')
                            .where('user_id', '=', userId)
                            .orderBy('created_at', 'desc')
                            .orderBy('id', 'desc')
                            .whereNull('deleted_at');
                    }
                    return await Task.query()
                        .select('id', 'description', 'duration', 'project_id', 'project_name')
                        .orderBy('created_at', 'desc')
                        .orderBy('id', 'desc')
                        .where('user_id', '=', userId)
                        .whereNull('deleted_at');
                },
                async getTaskById(userId,taskId: string): Promise<ITask> {
                    const task = await Task.query()
                        .findById(taskId)
                        .where('user_id', '=', userId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }
                    return task;
                },
                async create(task,ctx): Promise<ITask> {
                    const createdTask = await Task.query().insert({
                        ...task,
                        user_id: ctx.meta.user?.id,
                        created_at: new Date,
                    });
                    return createdTask;
                },
                async renameTask(userId, taskId: string, description: string): Promise<ITask> {
                    const task = await Task.query()
                        .findById(taskId)
                        .where('user_id', '=', userId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }

                    const renamedTask = await task.$query()
                        .patchAndFetch({ description });
                    return renamedTask;
                },
                async delete(userId, taskId: string): Promise<ITask> {
                    const task = await Task.query()
                        .findById(taskId)
                        .where('user_id', '=', userId);

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
