import { ServiceBroker, Service, Context } from 'moleculer';
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
                    async handler(): Promise<ITask> {
                        return await this.getTasks();
                    }
                }
            },
            methods: {
                async getTasks(): Promise<ITask[]> {
                    return await Task.query();
                }
            }
        })
    }
}