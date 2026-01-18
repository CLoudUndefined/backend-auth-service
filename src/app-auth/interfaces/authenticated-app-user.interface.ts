import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';

export interface AuthenticatedAppUser {
    appId: number;
    id: number;
    email: string;
    roles: ApplicationRoleWithPermissionsModel[];
}
