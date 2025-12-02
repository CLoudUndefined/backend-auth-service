import { Global, Module } from '@nestjs/common';
import knex, { Knex } from 'knex';
import config from 'knexfile';
import { Model } from 'objection';

const knexProvider = {
    provide: 'KnexConnection',
    useFactory: async (): Promise<Knex> => {
        const knexInstance = knex(config);
        Model.knex(knexInstance);
        return knexInstance;
    },
};

@Global()
@Module({
    providers: [knexProvider],
    exports: [knexProvider],
})
export class DatabaseModule {}
