import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';

@Injectable({ scope: Scope.REQUEST })
export class AppRoleDataLoader {
    constructor(private readonly appRolesRepository: AppRolesRepository) {}

    public readonly batchPermissions = new DataLoader<number, ApplicationPermissionModel[]>(
        async (roleIds: number[]) => {
            const roles = await this.appRolesRepository.findByIdsWithPermissions(roleIds);

            const rolesMap = new Map(roles.map((role) => [role.id, role.permissions || []]));

            return roleIds.map((roleId) => rolesMap.get(roleId) || []);
        },
    );
}
