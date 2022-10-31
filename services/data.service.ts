import { ServiceBroker, Service, Errors, Context} from 'moleculer';
import { ITask, Task } from '../models/task';

export default class TaskService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);

        this.parseServiceSchema({
            name: 'data',
            actions: {
                //TODO: need "endpoint" to count "tasks" and "projects"
                getCountByProjectName: {
                    auth: 'required',
                    rest: 'GET /count/name',
                    async handler(ctx): Promise<any[]> {
                        return await this.getCountByProjectName(ctx.meta.user?.id);
                    }
                },
                getCountByCreated: {
                    auth: 'required',
                    rest: 'GET /count/created',
                    async handler(ctx): Promise<any[]> {
                        return await this.getCountByCreated(ctx.meta.user?.id);
                    }
                },
                getSumByCreated: {
                    auth: 'required',
                    rest:'GET /sum/created',
                    async handler(ctx): Promise<any[]> {
                        return await this.getSumByCreated(ctx.meta.user?.id);
                    }
                },
                getDurationSum: {
                    auth: 'required',
                    rest: 'GET /sum/duration',
                    async handler(ctx): Promise<any> {
                        return await this.getDurationSum(ctx.meta.user?.id);
                    }
                },
                getLongestTask: {
                    auth: 'required',
                    rest:'GET /longest/task',
                    async handler(ctx): Promise<any> {
                        return await this.getLongestTask(ctx.meta.user?.id);
                    }
                },
            },
            methods: {
                async getCountByProjectName(userId): Promise<any[]> {
                    return await Task.query()
                        .select('project_name')
                        .where('user_id', '=', userId)
                        .whereNull('deleted_at')
                        .groupBy('project_name')
                        .count('project_name', { as: 'quantity' });
                },
                async getSumByCreated(userId): Promise<any[]> {
                    return await Task.query()
                        .select('created_at')
                        .where('user_id', '=', userId)
                        .whereNull('deleted_at')
                        .groupBy('created_at')
                        .sum('duration as total');
                },
                async getCountByCreated(userId): Promise<any[]> {
                    return await Task.query()
                        .select('created_at')
                        .where('user_id', '=', userId)
                        .whereNull('deleted_at')
                        .groupBy('created_at')
                        .count('created_at', { as: 'count' });
                },
                async getDurationSum(userId): Promise<any> {
                    const sum = await Task.query()
                    .where('user_id', '=', userId)
                    .whereNull('deleted_at')
                        .sum('duration as total');
                    return sum[0];
                },
                async getLongestTask(userId): Promise<any> {
                    return await Task.query()
                        .select('description', 'duration')
                        .where('user_id', '=', userId)
                        .whereNull('deleted_at')
                        .orderBy('duration', 'desc')
                        .first();
                },
            }
        })
    }
}
