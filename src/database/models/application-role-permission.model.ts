import { Model } from 'objection';
import type { ApplicationRoleModel } from './application-role.model';
import type { ApplicationPermissionModel } from './application-permission.model';

export class ApplicationRolePermissionModel extends Model {
    static get tableName() {
        return 'applicationRolePermission';
    }

    static get idColumn() {
        return ['roleId', 'permissionId'];
    }

    roleId!: number;
    permissionId!: number;
    createdAt: Date;

    role?: ApplicationRoleModel;
    permission?: ApplicationPermissionModel;
}
