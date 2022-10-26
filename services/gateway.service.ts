import { Service, ServiceBroker } from 'moleculer';
import ApiGateway from 'moleculer-web';
const _ = require("lodash");
const { UnAuthorizedError } = ApiGateway.Errors;

export default class ApiService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'api',
            mixins: [ApiGateway],
            settings: {
                cors: {
                    // Configures the Access-Control-Allow-Origin CORS header.
                    origin: '*',
                    // Configures the Access-Control-Allow-Methods CORS header.
                    methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
                    // Configures the Access-Control-Allow-Headers CORS header.
                    allowedHeaders: '*',
                    // Configures the Access-Control-Expose-Headers CORS header.
                    exposedHeaders: [],
                    // Configures the Access-Control-Allow-Credentials CORS header.
                    credentials: false,
                    // Configures the Access-Control-Max-Age CORS header.
                    maxAge: 3600
                },
                port: process.env.PORT || 3355,
                routes: [
                    {
                        authorization: true,
                        path: '/api',
                        whitelist: ['**'],
                        autoAliases: true,

                        // Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
                        mappingPolicy: "all", // Available values: "all", "restrict"

                        // Enable/disable logging
                        logging: true
                    },
                ],
                assets: {
                    folder: "public",

                    // Options to `server-static` module
                    options: {}
                }
            },
            methods: {
                /**
                 * Authorize the request
                 *
                 * @param {Context} ctx
                 * @param {Object} route
                 * @param {IncomingRequest} req
                 * @returns {Promise}
                 */
                async authorize(ctx, route, req) {
                    let token;
                    if (req.headers.authorization) {
                        let type = req.headers.authorization.split(" ")[0];
                        if (type === "Token" || type === "Bearer")
                            token = req.headers.authorization.split(" ")[1];
                    }

                    let user;
                    if (token) {
                        // Verify JWT token
                        try {
                            user = await ctx.call("users.resolveToken", { token });
                            if (user) {
                                this.logger.info("Authenticated via JWT: ", user.email);
                                // Reduce user fields (it will be transferred to other nodes)
                                ctx.meta.user = _.pick(user, ["id", "email"]);
                                ctx.meta.token = token;
                                ctx.meta.userID = user.id;
                            }
                        } catch (err) {
                            // Ignored because we continue processing if user doesn't exists
                        }
                    }

                    if (req.$action.auth == "required" && !user)
                        throw new UnAuthorizedError('a', 10);
                }
            }
        })
    }
}