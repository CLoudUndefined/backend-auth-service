import { Model } from 'objection';
import { BaseModelWithUpdate } from './base-with-update.model';
import type { ServiceUserModel } from './service-user.model';

export class ServiceUserRecoveryModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'service_user_recoveries';
    }

    userId!: number;
    question!: string;
    answerHash!: string;

    user?: ServiceUserModel;

    static get relationMappings() {
        const ServiceUserModel = require('./service-user.model');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceUserModel,
                join: {
                    from: 'service_user_recoveries.userId',
                    to: 'service_users.id',
                },
            },
        };
    }
}
