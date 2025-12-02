import { Module } from '@nestjs/common';
import { ServiceUsersModule } from './service-users/service-users.module';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { AppAuthModule } from './app-auth/app-auth.module';
import { AppUsersModule } from './app-users/app-users.module';
import { AppRolesModule } from './app-roles/app-roles.module';
import { AppPermissionsModule } from './app-permissions/app-permissions.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [
        ServiceUsersModule,
        AuthModule,
        AppsModule,
        AppAuthModule,
        AppUsersModule,
        AppRolesModule,
        AppPermissionsModule,
        DatabaseModule,
    ],
})
export class AppModule {}
