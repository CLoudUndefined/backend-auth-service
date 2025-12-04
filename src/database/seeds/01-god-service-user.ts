import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    await knex('service_users').del();

    const passwordHash = await bcrypt.hash('Arrive.Slabs.Doubt.Research7', 10);

    await knex('service_users').insert([
        {
            email: 'god@system.local',
            passwordHash: passwordHash,
            isGod: true,
        },
    ]);

    console.log('God service user created');
    console.log('Email: god@system.local');
    console.log('Password: `Arrive.Slabs.Doubt.Research7`');
    console.log('Please change this password after first login');
}
