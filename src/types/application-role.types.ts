import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';

export type ApplicationRoleWithPermissionsModel = Omit<ApplicationRoleModel, 'permissions'> & {
    permissions: ApplicationPermissionModel[];
};
