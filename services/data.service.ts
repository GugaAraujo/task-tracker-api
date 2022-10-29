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
                    async handler(): Promise<any[]> {
                        return await this.getCountByProjectName();
                    }
                },
                getCountByCreated: {
                    auth: 'required',
                    rest: 'GET /count/created',
                    async handler(): Promise<any[]> {
                        return await this.getCountByCreated();
                    }
                },
                getSumByCreated: {
                    auth: 'required',
                    rest:'GET /sum/created',
                    async handler(): Promise<any[]> {
                        return await this.getSumByCreated();
                    }
                },
                getDurationSum: {
                    auth: 'required',
                    rest: 'GET /sum/duration',
                    async handler(): Promise<any> {
                        return await this.getDurationSum();
                    }
                },
                getLongestTask: {
                    auth: 'required',
                    rest:'GET /longest/task',
                    async handler(): Promise<any> {
                        return await this.getLongestTask();
                    }
                },
            },
            methods: {
                async getCountByProjectName(): Promise<any[]> {
                    return await Task.query()
                        .select('project_name')
                        .whereNull('deleted_at')
                        .groupBy('project_name')
                        .count('project_name', { as: 'quantity' });
                },
                async getSumByCreated(): Promise<any[]> {
                    return await Task.query()
                        .select('created_at')
                        .whereNull('deleted_at')
                        .groupBy('created_at')
                        .sum('duration as total');
                },
                async getCountByCreated(): Promise<any[]> {
                    return await Task.query()
                        .select('created_at')
                        .whereNull('deleted_at')
                        .groupBy('created_at')
                        .count('created_at', { as: 'count' });
                },
                async getDurationSum(): Promise<any> {
                    const sum = await Task.query()
                        .whereNull('deleted_at')
                        .sum('duration as total');
                    return sum[0];
                },
                async getLongestTask(): Promise<any> {
                    return await Task.query()
                        .select('description', 'duration')
                        .whereNull('deleted_at')
                        .orderBy('duration', 'desc')
                        .first();
                },
            }
        })
    }
}