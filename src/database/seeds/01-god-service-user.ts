import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

export async function seed(knex: Knex): Promise<void> {
    await knex('serviceUsers').del();

    const godEmail = process.env.GOD_USER_EMAIL;
    const godPassword = process.env.GOD_USER_PASSWORD;

    if (!godPassword) {
        throw new Error('GOD_USER_PASSWORD must be set in .env file');
    }

    if (!godEmail) {
        throw new Error('GOD_USER_EMAIL must be set in .env file');
    }

    const passwordHash = await bcrypt.hash(godPassword, 10);

    await knex('serviceUsers').insert([
        {
            email: godEmail,
            passwordHash: passwordHash,
            isGod: true,
        },
    ]);

    console.log('God service user created');
    console.log('Credits provided from .env file');
}
