import { Module } from '@nestjs/common';
import { ServiceUsersModule } from './service-users/service-users.module';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { AppAuthModule } from './app-auth/app-auth.module';
import { AppUsersModule } from './app-users/app-users.module';
import { AppRolesModule } from './app-roles/app-roles.module';
import { AppPermissionsModule } from './app-permissions/app-permissions.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { EncryptionModule } from './common/encryption/encryption.module';
import * as Joi from 'joi';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: Joi.object({
                POSTGRES_PORT: Joi.number().port().default(5432),
                POSTGRES_HOST: Joi.string().default('localhost'),
                POSTGRES_USER: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DB: Joi.string().default('backend_auth_db'),
                JWT_SECRET: Joi.string().min(64).required(),
                JWT_REFRESH_SECRET: Joi.string().min(64).required(),
                JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
                JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
                APP_ENCRYPTION_KEY: Joi.string().length(64).hex().required(),
            }),
        }),
        ServiceUsersModule,
        AuthModule,
        AppsModule,
        AppAuthModule,
        AppUsersModule,
        AppRolesModule,
        AppPermissionsModule,
        DatabaseModule,
        EncryptionModule,
    ],
})
export class AppModule {}
