import { Model } from 'objection';
import { BaseModel } from './base.model';
import { ServiceUserModel } from './service-user.model';

export class ServiceUserRefreshTokenModel extends BaseModel {
    static get tableName() {
        return 'serviceUserRefreshTokens';
    }

    userId: number;
    tokenHash: string;
    expiresAt: Date;

    user?: ServiceUserModel;

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceUserModel,
                join: {
                    from: 'serviceUserRefreshTokens.userId',
                    to: 'serviceUsers.id',
                },
            },
        };
    }
}
