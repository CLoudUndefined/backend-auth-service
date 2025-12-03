import { Model } from 'objection';
import type { ApplicationUserModel } from './application-user.model';
import { BaseModelWithUpdate } from './base-with-update.model';

export class ApplicationUserRecoveryModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'application_user_recoveries';
    }

    userId!: number;
    question!: string;
    answerHash!: string;

    user?: ApplicationUserModel;

    static get relationMappings() {
        const ApplicationUserModel = require('./application-user.model');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ApplicationUserModel,
                join: {
                    from: 'application_user_recoveries.userId',
                    to: 'application_users.id',
                },
            },
        };
    }
}
