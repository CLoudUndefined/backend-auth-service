import { Model } from 'objection';
import { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import { ApplicationUserRecoveryModel } from './application-user-recovery.model';
import { ApplicationUserRefreshTokenModel } from './application-user-refresh-tokens.model';
import { ApplicationRoleModel } from './application-role.model';

export class ApplicationUserModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'applicationUsers';
    }

    appId: number;
    email: string;
    passwordHash: string;
    isBanned: boolean;

    app?: ApplicationModel;
    recoveries?: ApplicationUserRecoveryModel[];
    refreshTokens?: ApplicationUserRefreshTokenModel[];
    roles?: ApplicationRoleModel[];

    static get relationMappings() {
        return {
            app: {
                relation: Model.BelongsToOneRelation,
                modelClass: ApplicationModel,
                join: {
                    from: 'applicationUsers.appId',
                    to: 'applications.id',
                },
            },
            recoveries: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationUserRecoveryModel,
                join: {
                    from: 'applicationUsers.id',
                    to: 'applicationUserRecoveries.userId',
                },
            },
            refreshTokens: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationUserRefreshTokenModel,
                join: {
                    from: 'applicationUsers.id',
                    to: 'applicationUserRefreshTokens.userId',
                },
            },
            roles: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationRoleModel,
                join: {
                    from: 'applicationUsers.id',
                    through: {
                        from: 'applicationUserRole.userId',
                        to: 'applicationUserRole.roleId',
                        extra: ['createdAt'],
                    },
                    to: 'applicationRoles.id',
                },
            },
        };
    }
}
