"use strict";

import { IUser, User } from "../models/user";

import { Service, ServiceBroker, Context } from 'moleculer';
const { MoleculerClientError, MoleculerError } = require("moleculer").Errors;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userInfo } from "os";


export default class ProjectService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: "users",
            /**
             * Actions
             */
            actions: {
                /**
                 * Login with username & password
                 *
                 * @actions
                 * @param {Object} user - User credentials
                 *
                 * @returns {Object} Logged in user with token
                 */
                login: {
                    rest: "POST /login",
                    params: {
                        $$strict: true,
                        email: { type: "email" },
                        password: 'string|min:6|max:8',
                        token: { type: 'string', optional: true }
                    },
                    async handler(ctx: any): Promise<any> {
                        return await this.login(ctx);
                    }
                },

                /**
                 * Register a new user
                 *
                 * @actions
                 * @param {Object} user - User entity
                 *
                 * @returns {Object} Created entity & token
                 */
                create: {
                    rest: "POST /create",
                    params: {
                        $$strict: true,
                        username: { type: 'string' },
                        email: { type: 'email', trim: true },
                        password: 'string|min:6|max:8',
                        confirmPwd: 'string|min:6|max:8',
                        agreeTerms: { type: "boolean", value: 'true', strict: true }
                    },
                    async handler(ctx: any): Promise<any> {
                        return await this.create(ctx);
                    }
                },

                /**
                * Remove "First access" status.
                *
                * @actions
                *
                * @returns {Object} user entity
                */
                removeFirstAccessStatus: {
                    auth: 'required',
                    rest: "PUT /remove_first_acess",
                    async handler(ctx: any): Promise<any> {
                        return await this.removeFirstAccessStatus(ctx);
                    }
                },

                /**
                * Generate Tasks and Projects samples to new users.
                *
                * @actions
                *
                * @returns {Object} created data+
                */
                generateData: {
                    auth: 'required',
                    rest: "PUT /generate_data",
                    async handler(ctx: any): Promise<any> {
                        return await this.generateData(ctx);
                    }
                },

                /**
                 * Get user by JWT token (for API GW authentication)
                 *
                 * @actions
                 * @param {String} token - JWT token
                 *
                 * @returns {Object} Resolved user
                 */
                resolveToken: {
                    cache: {
                        keys: ["token"],
                        ttl: 60 * 60 // 1 hour
                    },
                    params: {
                        token: "string"
                    },
                    async handler(ctx: any): Promise<any> {
                        return await this.resolveToken(ctx);
                    }
                },
            },
            methods: {
                async login(ctx) {
                    const { email, password } = ctx.params;
                    let { token } = ctx.params;

                    try {
                        const user: IUser = await User.query().findOne({ email });
                        if (!user)
                            throw new MoleculerClientError("Email is not found", 401);

                        const res = await bcrypt.compare(password, user.password);
                        if (!res)
                            throw new MoleculerClientError("Password incorrect", 401);

                        token = await this.generateToken(user.id, email);

                        return { token };
                    } catch (error: any) {
                        throw new MoleculerError(error.message, error.code);
                    }
                },
                async create(ctx) {
                    const { email } = ctx.params;
                    const user: IUser = await User.query().findOne({ email });
                    if (user) {
                        throw new MoleculerClientError("This email already exists", 422);
                    };
                    if (ctx.params?.password !== ctx.params?.confirmPwd) {
                        throw new MoleculerClientError('Passwords must be the same!', 422);
                    };

                    return await this.generateHash(ctx).then(async (hash: any) => {
                        await User.query().insert({
                            username: ctx.params?.username,
                            email: ctx.params?.email,
                            password: hash,
                            first_access: true,
                        });
                        return { data: { message: 'created' } };
                    });
                },
                async generateToken(userId, email) {
                    const today = new Date();
                    const exp = new Date(today);
                    exp.setDate(today.getDate() + 60);

                    return jwt.sign({
                        id: userId,
                        email: email,
                        exp: Math.floor(exp.getTime() / 1000)
                    }, process.env.JWT_SECRET as string);
                },
                async generateHash(ctx) {
                    return await bcrypt.hash(ctx.params?.password, 10);
                },
                async generateData(ctx): Promise<any> {
                    const createdBackendProject = await ctx.call('project.create', {
                        name: 'Backend'
                    }, ctx);
                    const createdFrontendProject = await ctx.call('project.create', {
                        name: 'Frontend'
                    }, ctx);
                    const createdFullstackProject = await ctx.call('project.create', {
                        name: 'Fullstack'
                    }, ctx);

                    const createdMoleculeTask = await ctx.call('task.create', {
                        description: 'Estudo de Moleculer',
                        duration: 3651,
                        project_id: createdBackendProject.id,
                        project_name: createdBackendProject.name,
                    }, ctx);

                    const createdVueTask = await ctx.call('task.create', {
                        description: 'Estudo de Vue',
                        duration: 2876,
                        project_id: createdFrontendProject.id,
                        project_name: createdFrontendProject.name,
                    }, ctx);

                    const createdTypescriptTask = await ctx.call('task.create', {
                        description: 'Estudo de Typescript',
                        duration: 2076,
                        project_id: createdFrontendProject.id,
                        project_name: createdFrontendProject.name,
                    }, ctx);

                    await this.removeFirstAccessStatus(ctx);

                    return {
                        message: 'created',
                        projects: [
                            await createdBackendProject.id,
                            await createdFrontendProject.id,
                            await createdFullstackProject.id,
                        ],
                        tasks: [
                            await createdMoleculeTask.id,
                            await createdVueTask.id,
                            await createdTypescriptTask.id,
                        ],
                    };
                },
                async resolveToken(ctx) {
                    const decoded: any = await new Promise((resolve, reject) => {
                        jwt.verify(ctx.params.token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
                            if (err)
                                return reject(err);

                            resolve(decoded);
                        });
                    });
                    if (decoded?.id) {
                        return await User.query().findById(decoded.id)
                    }
                },
                async removeFirstAccessStatus(ctx) {
                    const user = await User.query()
                        .patchAndFetchById(ctx.meta.user.id, {
                            first_access: false,
                        });
                    if (user) {
                        return {
                            message: 'success',
                        };
                    }
                    else {
                        return {
                            message: 'failed',
                        };
                    };
                },
            },
        });
    };
};
