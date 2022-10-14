export default {
    client: 'pg',
    useNullAsDefault: true,
    connection: {
        connectionString: process.env.PG_CONNECTION_STRING,
        ssl: {
            rejectUnauthorized: false
        }
    },
    searchPath: ['knex', 'public'],
};
