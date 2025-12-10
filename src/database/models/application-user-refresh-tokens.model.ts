import { Model } from 'objection';
import { ApplicationUserModel } from './application-user.model';
import { BaseModel } from './base.model';

export class ApplicationUserRefreshTokenModel extends BaseModel {
    static get tableName() {
        return 'applicationUserRefreshTokens';
    }

    userId: number;
    tokenHash: string;
    expiresAt: Date;

    user?: ApplicationUserModel;

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ApplicationUserModel,
                join: {
                    from: 'applicationUserRefreshTokens.userId',
                    to: 'applicationUsers.id',
                },
            },
        };
    }
}
