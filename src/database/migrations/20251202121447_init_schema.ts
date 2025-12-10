import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('service_users', (table) => {
        table.increments('id').primary();
        table.text('email').notNullable().unique();
        table.text('password_hash').notNullable();
        table.boolean('is_god').defaultTo(false).notNullable();
        table.boolean('is_banned').defaultTo(false).notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable('service_user_recoveries', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('service_users').onDelete('CASCADE').notNullable();
        table.text('question').notNullable();
        table.text('answer_hash').notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable('service_user_refresh_tokens', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('service_users').onDelete('CASCADE').notNullable();
        table.text('token_hash').notNullable();
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });

    await knex.schema.createTable('applications', (table) => {
        table.increments('id').primary();
        table
            .integer('owner_id')
            .unsigned()
            .references('id')
            .inTable('service_users')
            .onDelete('CASCADE')
            .notNullable();
        table.text('name').notNullable();
        table.text('description').nullable();
        table.text('encrypted_secret').notNullable();
        table.timestamps(true, true);
        table.unique(['owner_id', 'name']);
    });

    await knex.schema.createTable('application_users', (table) => {
        table.increments('id').primary();
        table.integer('app_id').unsigned().references('id').inTable('applications').onDelete('CASCADE').notNullable();
        table.text('email').notNullable();
        table.text('password_hash').notNullable();
        table.boolean('is_banned').defaultTo(false).notNullable();
        table.timestamps(true, true);
        table.unique(['app_id', 'email']);
    });

    await knex.schema.createTable('application_user_recoveries', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('application_users')
            .onDelete('CASCADE')
            .notNullable();
        table.text('question').notNullable();
        table.text('answer_hash').notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable('application_user_refresh_tokens', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('application_users')
            .onDelete('CASCADE')
            .notNullable();
        table.text('token_hash').notNullable();
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });

    await knex.schema.createTable('application_roles', (table) => {
        table.increments('id').primary();
        table.integer('app_id').unsigned().references('id').inTable('applications').onDelete('CASCADE').notNullable();
        table.text('name').notNullable();
        table.text('description').nullable();
        table.timestamps(true, true);
        table.unique(['app_id', 'name']);
    });

    await knex.schema.createTable('application_user_role', (table) => {
        table
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('application_users')
            .onDelete('CASCADE')
            .notNullable();
        table
            .integer('role_id')
            .unsigned()
            .references('id')
            .inTable('application_roles')
            .onDelete('CASCADE')
            .notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.primary(['user_id', 'role_id']);
    });

    await knex.schema.createTable('application_permissions', (table) => {
        table.increments('id').primary();
        table.text('name').notNullable();
        table.text('description').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });

    await knex.schema.createTable('application_role_permission', (table) => {
        table
            .integer('role_id')
            .unsigned()
            .references('id')
            .inTable('application_roles')
            .onDelete('CASCADE')
            .notNullable();
        table
            .integer('permission_id')
            .unsigned()
            .references('id')
            .inTable('application_permissions')
            .onDelete('CASCADE')
            .notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.primary(['role_id', 'permission_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('application_role_permission');
    await knex.schema.dropTableIfExists('application_user_role');
    await knex.schema.dropTableIfExists('application_permissions');
    await knex.schema.dropTableIfExists('application_roles');
    await knex.schema.dropTableIfExists('application_user_refresh_tokens');
    await knex.schema.dropTableIfExists('application_user_recoveries');
    await knex.schema.dropTableIfExists('application_users');
    await knex.schema.dropTableIfExists('applications');
    await knex.schema.dropTableIfExists('service_user_refresh_tokens');
    await knex.schema.dropTableIfExists('service_user_recoveries');
    await knex.schema.dropTableIfExists('service_users');
}
