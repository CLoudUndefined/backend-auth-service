import { Model } from 'objection';
import type { ApplicationUserModel } from './application-user.model';
import { BaseModel } from './base.model';

export class ApplicationUserRefreshTokenModel extends BaseModel {
    static get tableName() {
        return 'application_user_refresh_tokens';
    }

    userId!: number;
    tokenHash!: string;
    expiresAt!: Date;

    user?: ApplicationUserModel;

    static get relationMappings() {
        const ApplicationUserModel = require('./application-user.model');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ApplicationUserModel,
                join: {
                    from: 'application_user_refresh_tokens.userId',
                    to: 'application_users.id',
                },
            },
        };
    }
}
