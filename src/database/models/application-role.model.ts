import { Model } from 'objection';
import type { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import type { ApplicationUserModel } from './application-user.model';
import type { ApplicationPermissionModel } from './application-permission.model';

export class ApplicationRoleModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'applicationRoles';
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
                    from: 'applicationRoles.appId',
                    to: 'applications.id',
                },
            },
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationUserModel,
                join: {
                    from: 'applicationRoles.id',
                    through: {
                        from: 'applicationUserRole.roleId',
                        to: 'applicationUserRole.userId',
                        extra: ['createdAt'],
                    },
                    to: 'applicationUsers.id',
                },
            },
            permissions: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationPermissionModel,
                join: {
                    from: 'applicationRoles.id',
                    through: {
                        from: 'applicationRolePermission.roleId',
                        to: 'applicationRolePermission.permissionId',
                        extra: ['createdAt'],
                    },
                    to: 'applicationPermissions.id',
                },
            },
        };
    }
}
