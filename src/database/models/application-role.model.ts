import { Model } from 'objection';
import { ApplicationModel } from './application.model';
import { BaseModelWithUpdate } from './base-with-update.model';
import { ApplicationUserModel } from './application-user.model';
import { ApplicationPermissionModel } from './application-permission.model';

export class ApplicationRoleModel extends BaseModelWithUpdate {
    static get tableName() {
        return 'applicationRoles';
    }

    appId: number;
    name: string;

    description?: string;

    app?: ApplicationModel;
    users?: ApplicationUserModel[];
    permissions?: ApplicationPermissionModel[];

    static get relationMappings() {
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
