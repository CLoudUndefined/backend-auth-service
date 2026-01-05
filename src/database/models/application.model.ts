import { Model } from 'objection';
import { BaseModelWithUpdate } from './base-with-update.model';
import { ServiceUserModel } from './service-user.model';
import { ApplicationUserModel } from './application-user.model';
import { ApplicationRoleModel } from './application-role.model';
import { Exclude } from 'class-transformer';

export class ApplicationModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'applications';
    }

    ownerId: number;
    name: string;

    @Exclude()
    encryptedSecret: string;

    description?: string;

    owner: ServiceUserModel;
    users?: ApplicationUserModel[];

    static get relationMappings() {
        return {
            owner: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceUserModel,
                join: {
                    from: 'applications.ownerId',
                    to: 'serviceUsers.id',
                },
            },
            users: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationUserModel,
                join: {
                    from: 'applications.id',
                    to: 'applicationUsers.appId',
                },
            },
            roles: {
                relation: Model.HasManyRelation,
                modelClass: ApplicationRoleModel,
                join: {
                    from: 'applications.id',
                    to: 'applicationRoles.appId',
                },
            },
        };
    }
}
