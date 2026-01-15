import { ApplicationUserModel } from 'src/database/models/application-user.model';
import { ApplicationRoleWithPermissionsModel } from './application-role.types';

export type ApplicationUserWithRolesAndPermissionsModel = Omit<ApplicationUserModel, 'roles'> & {
    roles: ApplicationRoleWithPermissionsModel[];
};
