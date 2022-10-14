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
                }
            },
            methods: {
                async getTasks(): Promise<ITask[]> {
                    return await Task.query();
                },
                async getTaskById(taskId: string): Promise<ITask> {
                    const task = await Task.query().findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }
                    return task;
                },
                async renameTask(taskId: string, description: string): Promise<ITask> {
                    const task = await Task.query().findById(taskId);

                    if (!task) {
                        throw new Errors.MoleculerClientError('Task not found', 404);
                    }

                    const renamedTask = await task.$query().patchAndFetch({description});
                    return renamedTask;
                }
            }
        })
    }
}