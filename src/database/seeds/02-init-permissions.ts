import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    await knex('application_permissions').del();

    await knex('application_permissions').insert([
        {
            id: 1,
            name: 'users.read',
            description: 'View application users',
        },
        {
            id: 2,
            name: 'users.manage',
            description: 'Manage application users (ban, delete, edit)',
        },
        {
            id: 3,
            name: 'app.manage',
            description: 'Manage the application',
        },
        {
            id: 4,
            name: 'roles.read',
            description: 'View roles',
        },
        {
            id: 5,
            name: 'roles.manage',
            description: 'Create roles, delete roles, assign permissions',
        },
    ]);
}
