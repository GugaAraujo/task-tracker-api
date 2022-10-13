import { ServiceBroker, Service, Context } from 'moleculer';
import ITask from './@types/task';

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
                        return this.getTasks();
                    }
                }
            },
            methods: {
                getTasks(): ITask[] {
                    return [
                        {
                            duration: 652,
                            description: 'Estudo de Nest.Js',
                            project: {
                                name: 'Backend',
                                id: 1
                            },
                            date: '08/06/2022',
                            id: 1
                        },
                        {
                            duration: 471,
                            description: 'Estudo de Vue.Js',
                            project: {
                                name: 'Frontend',
                                id: 2
                            },
                            date: '08/06/2022',
                            id: 2
                        },
                        {
                            duration: 547,
                            description: 'Estudo de PostgreSQL',
                            project: {
                                name: 'Database',
                                id: 3
                            },
                            date: '09/06/2022',
                            id: 3
                        },
                        {
                            duration: 382,
                            description: 'Estudo de Express',
                            project: {
                                name: 'Backend',
                                id: 1
                            },
                            date: '09/06/2022',
                            id: 4
                        },
                        {
                            duration: 689,
                            description: 'Estudo de TypeScript',
                            project: {
                                name: 'Fullstack',
                                id: 4
                            },
                            date: '10/06/2022',
                            id: 5
                        }
                    ]
                }
            }
        })
    }
}