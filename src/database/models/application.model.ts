import { Model } from 'objection';
import { BaseModelWithUpdate } from './base-with-update.model';
import type { ServiceUserModel } from './service-user.model';
import type { ApplicationUserModel } from './application-user.model';

export class ApplicationModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'applications';
    }

    ownerId!: number;
    name!: string;
    encryptedSecret!: string;

    description?: string;

    owner?: ServiceUserModel;
    users?: ApplicationUserModel[];

    static get relationMappings() {
        const ServiceUserModel = require('./service-user.model');
        const ApplicationUserModel = require('./application-user.model');
        const ApplicationRoleModel = require('./application-role.model');

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
