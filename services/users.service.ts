"use strict";

import { IUser, User } from "../models/user";

const { MoleculerClientError } = require("moleculer").Errors;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

module.exports = {
    name: "users",
    settings: {
        /** Validator schema for entity */
        entityValidator: {
            username: { type: "string", min: 2 },
            password: { type: "string", min: 6 },
            email: { type: "email" },
        }
    },
    /**
     * Actions
     */
    actions: {
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
                email: { type: 'email' },
                password: 'string|min:6|max:8',
                confirmPwd: 'string|min:6|max:8',
                agreeTerms: { type: "boolean", value: 'true', strict: true }
            },
            async handler(ctx: any): Promise<any> {
                const { email } = ctx.params;
                const user: IUser = await User.query().findOne({ email });
                if (user) {
                    throw new MoleculerClientError("This email already exists", 422);
                };

                if (ctx.params?.password !== ctx.params?.confirmPwd) {
                    throw new MoleculerClientError('Passwords must be the same!', 422);
                };

                return await bcrypt.hash(ctx.params?.password, 10).then(async (res: any) => {
                    await User.query().insert({
                        email: ctx.params?.email,
                        password: res,
                    });
                    return { data: { message: 'created' } };
                });
            }
        },

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
                email: { type: "email" },
                password: { type: "string", min: 6 },
            },
            async handler(ctx: any): Promise<any> {
                const { email, password } = ctx.params;
                let { token } = ctx.params;
                
                try {
                    const user: IUser = await User.query().findOne({ email });
                    if (!user)
                        throw new MoleculerClientError("wrong email!", 422, "", [{ field: "email", message: "is not found" }]);

                    const res = await bcrypt.compare(password, user.password);
                    if (!res)
                        throw new MoleculerClientError("Wrong password!", 422, "", [{ field: "password", message: "is incorrect" }]);

                    const today = new Date();
                    const exp = new Date(today);
                    exp.setDate(today.getDate() + 60);

                    token = jwt.sign({
                        id: user.id,
                        email: email,
                        exp: Math.floor(exp.getTime() / 1000)
                    }, process.env.JWT_SECRET as string);

                    return { token };
                } catch (error: any) {
                    throw new MoleculerClientError("Internal error", 500, error.code, error);
                }
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
            }
        },
    },
}
