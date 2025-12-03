import { Model } from 'objection';
import type { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import type { ApplicationUserRecoveryModel } from './application-user-recovery.model';
import type { ApplicationUserRefreshTokenModel } from './application-user-refresh-tokens.model';
import type { ApplicationRoleModel } from './application-role.model';

export class ApplicationUserModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'application_users';
    }

    appId!: number;
    email!: string;
    passwordHash!: string;
    isBanned!: boolean;

    app?: ApplicationModel;
    recoveries?: ApplicationUserRecoveryModel[];
    refreshTokens?: ApplicationUserRefreshTokenModel[];
    roles?: ApplicationRoleModel[];

    static get relationMappings() {
        const ApplicationModel = require('./application.model');
        const ApplicationUserRecoveryModel = require('./application-user-recovery.model');
        const ApplicationUserRefreshTokenModel = require('./application-user-refresh-tokens.model');
        const ApplicationRoleModel = require('./application-role.model');

        return {
            app: {
                relation: Model.BelongsToOneRelation,
                modelClass: ApplicationModel,
                join: {
                    from: 'application_users.appId',
                    to: 'applications.id',
                },
            },
            recoveries: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationUserRecoveryModel,
                join: {
                    from: 'application_users.id',
                    to: 'application_user_recoveries.userId',
                },
            },
            refreshTokens: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationUserRefreshTokenModel,
                join: {
                    from: 'application_users.id',
                    to: 'application_user_refresh_tokens.userId',
                },
            },
            roles: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationRoleModel,
                join: {
                    from: 'application_users.id',
                    through: {
                        from: 'application_user_role.userId',
                        to: 'application_user_role.roleId',
                        extra: ['createdAt'],
                    },
                    to: 'application_roles.id',
                },
            },
        };
    }
}
