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
                    auth: 'required',
                    rest: 'GET /all',
                    async handler(ctx): Promise<IProject[]> {
                        return await this.getProjects(ctx.meta.user?.id);
                    },
                },
                getProjectById: {
                    auth: 'required',
                    rest: 'GET /:id',
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx */
                    async handler(ctx): Promise<IProject> {
                        return await this.getProjectById(ctx.meta.user?.id, ctx.params?.id);
                    },
                },
                create: {
                    auth: 'required',
                    rest:'POST /create',
                    params: {
                        name: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<IProject> {
                        return await this.create(ctx.params?.name, ctx);
                    }
                },
                renameProject: {
                    auth: 'required',
                    rest: 'PUT /edit/:id',
                    params: {
                        id: 'string',
                        name: 'string'
                    },
                    /** @param {Context} ctx */
                    async handler(ctx): Promise<IProject> {
                        return await this.renameProject(ctx.meta.user?.id, ctx.params?.id, ctx.params?.name);
                    },
                },
                delete: {
                    auth: 'required',
                    rest: 'DELETE /delete/:id',
                    params: {
                        id: 'string',
                    },
                    /** @param {Context} ctx  */
                    async handler(ctx): Promise<IProject> {
                        return await this.delete(ctx.meta.user?.id, ctx.params?.id);
                    }
                },
            },
            methods: {
                async getProjects(userId): Promise<IProject[]> {
                    return await Project.query()
                        .where('user_id', '=', userId)
                        .where('deleted_at', null);
                },
                async getProjectById(userId, projectId: string): Promise<IProject> {
                    const project = await Project.query()
                        .findById(projectId)
                        .where('user_id', '=', userId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }
                    return project;
                },
                async create(name, ctx: any): Promise<IProject> {
                    const createdProject = await Project.query()
                        .insert({
                            name,
                            created_at: new Date,
                            user_id: ctx.meta.user?.id,
                        });
                    return createdProject;
                },
                async renameProject(userId, projectId: string, name: string): Promise<IProject> {
                    const project = await Project.query()
                        .findById(projectId)
                        .where('user_id', '=', userId);

                    if (!project) {
                        throw new Errors.MoleculerClientError('Project not found', 404);
                    }

                    const renamedProject = await project.$query().patchAndFetch({ name });
                    return renamedProject;
                },
                async delete(userId, projectId: string): Promise<IProject> {
                    const project = await Project.query()
                        .findById(projectId)
                        .where('user_id', '=', userId);

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
