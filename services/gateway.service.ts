import { Service, ServiceBroker } from 'moleculer';
import ApiGateway from 'moleculer-web';

export default class ApiService extends Service {
    public constructor(broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'api',
            mixins: [ApiGateway],
            settings: {
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