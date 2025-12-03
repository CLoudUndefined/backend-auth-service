import { Model } from 'objection';
import type { ApplicationRoleModel } from './application-role.model';
import { BaseModel } from './base.model';

export class ApplicationPermissionModel extends BaseModel {
    static get tableName() {
        return 'application_permissions';
    }

    name!: string;

    description?: string;

    roles?: ApplicationRoleModel[];

    static get relationMappings() {
        const ApplicationRoleModel = require('./application-role.model');
        return {
            roles: {
                relation: Model.ManyToManyRelation,
                modelClass: ApplicationRoleModel,
                join: {
                    from: 'application_permissions.id',
                    through: {
                        from: 'application_role_permission.permissionId',
                        to: 'application_role_permission.roleId',
                        extra: ['createdAt'],
                    },
                    to: 'application_roles.id',
                },
            },
        };
    }
}
