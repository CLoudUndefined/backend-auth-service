import { Model } from 'objection';
import type { ApplicationRoleModel } from './application-role.model';
import { BaseModel } from './base.model';

export class ApplicationPermissionModel extends BaseModel {
    static get tableName() {
        return 'applicationPermissions';
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
                    from: 'applicationPermissions.id',
                    through: {
                        from: 'applicationRolePermission.permissionId',
                        to: 'applicationRolePermission.roleId',
                        extra: ['createdAt'],
                    },
                    to: 'applicationRoles.id',
                },
            },
        };
    }
}
