import { Model } from 'objection';
import { BaseModel } from './base.model';
import type { ServiceUserModel } from './service-user.model';

export class ServiceUserRefreshTokenModel extends BaseModel {
    static get tableName() {
        return 'service_user_refresh_tokens';
    }

    userId!: number;
    tokenHash!: string;
    expiresAt!: Date;

    user?: ServiceUserModel;

    static get relationMappings() {
        const ServiceUserModel = require('./service-user.model');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceUserModel,
                join: {
                    from: 'service_user_refresh_tokens.userId',
                    to: 'service_users.id',
                },
            },
        };
    }
}
