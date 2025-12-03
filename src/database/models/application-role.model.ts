import { Model } from 'objection';
import type { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import type { ApplicationUserModel } from './application-user.model';
import type { ApplicationPermissionModel } from './application-permission.model';

export class ApplicationRoleModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'application_roles';
    }

    appId!: number;
    name!: string;

    description?: string;

    app?: ApplicationModel;
    users?: ApplicationUserModel[];
    permissions?: ApplicationPermissionModel[];

    static get relationMappings() {
        const ApplicationModel = require('./application.model');
        const ApplicationUserModel = require('./application-user.model');
        const ApplicationPermissionModel = require('./application-permission.model');

        return {
            app: {
                relation: Model.BelongsToOneRelation,
                modelClass: ApplicationModel,
                join: {
                    from: 'application_roles.appId',
                    to: 'applications.id',
                },
            },
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationUserModel,
                join: {
                    from: 'application_roles.id',
                    through: {
                        from: 'application_user_role.roleId',
                        to: 'application_user_role.userId',
                        extra: ['createdAt'],
                    },
                    to: 'application_users.id',
                },
            },
            permissions: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationPermissionModel,
                join: {
                    from: 'application_roles.id',
                    through: {
                        from: 'application_role_permission.roleId',
                        to: 'application_role_permission.permissionId',
                        extra: ['createdAt'],
                    },
                    to: 'application_permissions.id',
                },
            },
        };
    }
}
