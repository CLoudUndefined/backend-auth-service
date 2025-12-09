import { Model } from 'objection';
import type { ApplicationUserModel } from './application-user.model';
import type { ApplicationRoleModel } from './application-role.model';

export class ApplicationUserRoleModel extends Model {
    static get tableName() {
        return 'applicationUserRole';
    }

    static get idColumn() {
        return ['userId', 'roleId'];
    }

    userId: number;
    roleId: number;
    createdAt: Date;

    user?: ApplicationUserModel;
    role?: ApplicationRoleModel;
}
