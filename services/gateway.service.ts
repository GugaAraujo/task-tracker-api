import { Service, ServiceBroker } from 'moleculer';
import ApiGateway from 'moleculer-web';

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
                        path: '/',
                        whitelist: ['**'],
                        autoAliases: true,
                    }
                ]
            }
        })
    }
}