import { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import * as dotenv from 'dotenv';

dotenv.config();

// TODO: In the future, divide this config into development and production
const config: Knex.Config = {
    client: 'postgresql',
    connection: {
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
        min: 1,
        max: 5,
    },
    migrations: {
        directory: './src/database/migrations',
        extension: 'ts',
        tableName: 'knex_migrations',
    },
    seeds: {
        directory: './src/database/seeds',
        extension: 'ts',
    },
    ...knexSnakeCaseMappers(),
};

export default config;
