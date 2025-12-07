import { Global, Module } from '@nestjs/common';
import knex, { Knex } from 'knex';
import config from 'knexfile';
import { Model } from 'objection';
import { AppRolesRepository } from './repositories/app-roles.repository';
import { AppPermissionsRepository } from './repositories/app-permissions.repository';
import { AppsRepository } from './repositories/apps.repository';
import { AppUsersRepository } from './repositories/app-users.repository';
import { ServiceUsersRepository } from './repositories/service-users.repository';
import { ApplicationRoleModel } from './models/application-role.model';
import { ApplicationRolePermissionModel } from './models/application-role-permission.model';
import { ApplicationPermissionModel } from './models/application-permission.model';
import { ApplicationModel } from './models/application.model';
import { ApplicationUserModel } from './models/application-user.model';
import { ApplicationUserRoleModel } from './models/application-user-role.model';
import { ApplicationUserRecoveryModel } from './models/application-user-recovery.model';
import { ApplicationUserRefreshTokenModel } from './models/application-user-refresh-tokens.model';
import { ServiceUserModel } from './models/service-user.model';
import { ServiceUserRecoveryModel } from './models/service-user-recovery.model';
import { ServiceUserRefreshTokenModel } from './models/service-user-refresh-token.model';

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
    providers: [
        knexProvider,
        AppPermissionsRepository,
        AppRolesRepository,
        AppsRepository,
        AppUsersRepository,
        ServiceUsersRepository,
        ApplicationPermissionModel,
        ApplicationRoleModel,
        ApplicationRolePermissionModel,
        ApplicationModel,
        ApplicationUserModel,
        ApplicationUserRoleModel,
        ApplicationUserRecoveryModel,
        ApplicationUserRefreshTokenModel,
        ServiceUserModel,
        ServiceUserRecoveryModel,
        ServiceUserRefreshTokenModel,
    ],
    exports: [
        knexProvider,
        AppPermissionsRepository,
        AppRolesRepository,
        AppsRepository,
        AppUsersRepository,
        ServiceUsersRepository,
    ],
})
export class DatabaseModule {}
