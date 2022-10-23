'use strict'

import { BrokerOptions } from 'moleculer';
const brokerConfig: BrokerOptions = {
    namespace: 'Task-Tracker-API',
    transporter: 'TCP',
};

export = brokerConfig;