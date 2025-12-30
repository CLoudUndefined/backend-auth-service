import { Model } from 'objection';
import { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import { ServiceUserRecoveryModel } from './service-user-recovery.model';
import { ServiceUserRefreshTokenModel } from './service-user-refresh-token.model';
import { Exclude } from 'class-transformer';

export class ServiceUserModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'serviceUsers';
    }

    email: string;
    isGod: boolean;

    @Exclude()
    passwordHash: string;

    @Exclude()
    isBanned: boolean;

    apps?: ApplicationModel[];
    recoveries?: ServiceUserRecoveryModel[];
    refreshTokens?: ServiceUserRefreshTokenModel[];

    static get relationMappings() {
        return {
            apps: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationModel,
                join: {
                    from: 'serviceUsers.id',
                    to: 'applications.ownerId',
                },
            },
            recoveries: {
                relation: Model.HasManyRelation,
                modelClass: ServiceUserRecoveryModel,
                join: {
                    from: 'serviceUsers.id',
                    to: 'serviceUserRecoveries.userId',
                },
            },
            refreshTokens: {
                relation: Model.HasManyRelation,
                modelClass: ServiceUserRefreshTokenModel,
                join: {
                    from: 'serviceUsers.id',
                    to: 'serviceUserRefreshTokens.userId',
                },
            },
        };
    }
}
