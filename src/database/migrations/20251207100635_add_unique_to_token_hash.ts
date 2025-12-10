import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('service_user_refresh_tokens', (table) => {
        table.unique('token_hash');
    });

    await knex.schema.alterTable('application_user_refresh_tokens', (table) => {
        table.unique('token_hash');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('service_user_refresh_tokens', (table) => {
        table.dropUnique(['token_hash']);
    });

    await knex.schema.alterTable('application_user_refresh_tokens', (table) => {
        table.dropUnique(['token_hash']);
    });
}
