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
                create: {
                    rest: {
                        method: 'POST',
                        path: '/'
                    },
                    params: {
                        name: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<IProject> {
                        return await this.create(ctx.params);
                    }
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
                delete: {
                    rest: {
                        method: 'DELETE',
                        path: '/:id',
                    },
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<IProject> {
                        return await this.delete(ctx.params?.id);
                    }
                },
            },
            methods: {
                async getProjects(): Promise<IProject[]> {
                    return await Project.query().where('deleted_at', null);
                },
                async getProjectById(projectId: string): Promise<IProject> {
                    const project = await Project.query().findById(projectId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }
                    return project;
                },
                async create(projectData: IProject): Promise<IProject> {
                    const createdProject = await Project.query()
                        .insert({ ...projectData });
                    return createdProject;
                },
                async renameProject(projectId: string, name: string): Promise<IProject> {
                    const project = await Project.query().findById(projectId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }

                    const renamedProject = await project.$query().patchAndFetch({ name });
                    return renamedProject;
                },
                async delete(projectId: string): Promise<IProject> {
                    const project = await Project.query().findById(projectId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }

                    const deletedProject = await project.$query()
                        .patchAndFetch({
                            deleted_at: new Date,
                        });
                    return deletedProject;
                },
            }
        })
    }
}