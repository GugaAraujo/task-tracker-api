import { Service, ServiceBroker, Context } from 'moleculer';
import IProject from './@types/project';

export default class ProjectService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);

        this.parseServiceSchema({
            name: 'project',
            actions: {
                getProjects: {
                    rest: {
                        method: 'GET',
                        path: '/'
                    },
                    async handler(): Promise<IProject> {
                        return this.getProjects();
                    }
                }
            },
            methods: {
                getProjects(): IProject[] {
                    return [
                        {
                            name: 'Backend',
                            id: 1
                        },
                        {
                            name: 'Frontend',
                            id: 2
                        },
                        {
                            name: 'Database',
                            id: 3
                        },
                        {
                            name: 'Fullstack',
                            id: 4
                        }
                    ]
                }
            }
        })
    }
}