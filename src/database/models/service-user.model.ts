import { Model } from 'objection';
import type { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import type { ServiceUserRecoveryModel } from './service-user-recovery.model';
import type { ServiceUserRefreshTokenModel } from './service-user-refresh-token.model';

export class ServiceUserModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'serviceUsers';
    }

    email!: string;
    passwordHash!: string;
    isGod!: boolean;
    isBanned!: boolean;

    apps!: ApplicationModel[];
    recoveries!: ServiceUserRecoveryModel[];
    refreshTokens!: ServiceUserRefreshTokenModel[];

    static get relationMappings() {
        const ApplicationModel = require('./application.model');
        const ServiceUserRecoveryModel = require('./service-user-recovery.model');
        const ServiceUserRefreshTokenModel = require('./service-user-refresh-token.model');

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
