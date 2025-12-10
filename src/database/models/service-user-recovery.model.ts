import { Model } from 'objection';
import { BaseModelWithUpdate } from './base-with-update.model';
import { ServiceUserModel } from './service-user.model';

export class ServiceUserRecoveryModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'serviceUserRecoveries';
    }

    userId: number;
    question: string;
    answerHash: string;

    user?: ServiceUserModel;

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceUserModel,
                join: {
                    from: 'serviceUserRecoveries.userId',
                    to: 'serviceUsers.id',
                },
            },
        };
    }
}
