import { ApplicationUserModel } from 'src/database/models/application-user.model';
import { ApplicationRoleWithPermissionsModel } from './application-role.types';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';

export type ApplicationUserWithRolesModel = Omit<ApplicationUserModel, 'roles'> & {
    roles: ApplicationRoleModel[];
};

export type ApplicationUserWithRolesAndPermissionsModel = Omit<ApplicationUserModel, 'roles'> & {
    roles: ApplicationRoleWithPermissionsModel[];
};
