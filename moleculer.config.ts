'use strict'

import { BrokerOptions } from 'moleculer';
const brokerConfig: BrokerOptions = {
    namespace: 'moleculer',
    transporter: 'TCP',
};

export = brokerConfig;