import { Service, ServiceBroker, Context } from 'moleculer';
import { Project } from '../data';
import { IProject } from '../models/project';

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
                        return await this.getProjects();
                    }
                }
            },
            methods: {
                async getProjects(): Promise<IProject[]> {
                    return await Project.query();
                }
            }
        })
    }
}