import { Service, ServiceBroker, Errors, Context } from 'moleculer';
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
                    async handler(): Promise<IProject[]> {
                        return await this.getProjects();
                    },
                },
                getProjectById: {
                    rest: {
                        method: 'GET',
                        path: '/:id',
                    },
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx */
                    async handler(ctx): Promise<IProject> {
                        return await this.getProjectById(ctx.params?.id);
                    },
                },
                renameProject: {
                    rest: {
                        method: 'PUT',
                        path: '/:id',
                    },
                    params: {
                        id: 'string',
                        name: 'string'
                    },
                    /** @param {Context} ctx */
                    async handler(ctx): Promise<IProject> {
                        return await this.renameProject(ctx.params?.id, ctx.params?.name);
                    },
                },
            },
            methods: {
                async getProjects(): Promise<IProject[]> {
                    return await Project.query();
                },
                async getProjectById(projectId: string): Promise<IProject> {
                    const project = await Project.query().findById(projectId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }
                    return project;
                },
                async renameProject(projectId: string, name: string): Promise<IProject> {
                    const project = await Project.query().findById(projectId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }

                    const renamedProject = await project.$query().patchAndFetch({ name });
                    return renamedProject;
                }
            }
        })
    }
}