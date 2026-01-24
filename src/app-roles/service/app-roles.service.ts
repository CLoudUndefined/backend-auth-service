import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';

@Injectable()
export class AppRolesService {
    constructor(
        private readonly appRolesRepository: AppRolesRepository,
        private readonly appPermissionsRepository: AppPermissionsRepository,
    ) {}

    async createRole(
        appId: number,
        name: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        const existingRole = await this.appRolesRepository.existsByNameInApp(appId, name);

        if (existingRole) {
            throw new ConflictException('Role with this name already exists');
        }

        const uniquePermissionIds = [...new Set(permissionIds)];
        const existingPermissionIds = await this.appPermissionsRepository.findExistingIds(uniquePermissionIds);

        if (existingPermissionIds.length !== uniquePermissionIds.length) {
            const missingPermissionIds = uniquePermissionIds.filter((id) => !existingPermissionIds.includes(id));
            throw new NotFoundException(`Permissions not found: ${missingPermissionIds.join(', ')}`);
        }

        return this.appRolesRepository.createWithPermissions(appId, name, description, existingPermissionIds);
    }

    async getAllRoles(appId: number): Promise<ApplicationRoleModel[]> {
        return this.appRolesRepository.findAllByApp(appId);
    }

    async getRole(appId: number, roleId: number): Promise<ApplicationRoleWithPermissionsModel> {
        const role = await this.appRolesRepository.findByIdWithPermissionsInApp(appId, roleId);

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async updateRole(
        appId: number,
        roleId: number,
        name?: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        const role = await this.appRolesRepository.findByIdInApp(appId, roleId);
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (name === undefined && description === undefined && permissionIds === undefined) {
            throw new BadRequestException('At least one field (name, description or permissionIds) must be provided');
        }

        if (name && name !== role.name) {
            const existingRole = await this.appRolesRepository.existsByNameInApp(appId, name);

            if (existingRole) {
                throw new ConflictException('Role with this name already exists');
            }
        }

        if (name !== undefined || description !== undefined) {
            await this.appRolesRepository.update(roleId, { name, description });
        }

        if (permissionIds !== undefined) {
            const uniquePermissionIds = [...new Set(permissionIds)];

            if (uniquePermissionIds.length > 0) {
                const existingPermissionIds = await this.appPermissionsRepository.findExistingIds(uniquePermissionIds);
                if (existingPermissionIds.length !== uniquePermissionIds.length) {
                    const missing = uniquePermissionIds.filter((id) => !existingPermissionIds.includes(id));
                    throw new NotFoundException(`Permissions not found: ${missing.join(', ')}`);
                }
            }

            await this.appRolesRepository.setPermissions(roleId, uniquePermissionIds);
        }

        const updatedRole = await this.appRolesRepository.findByIdWithPermissionsInApp(appId, roleId);

        if (!updatedRole) {
            throw new NotFoundException('Role not found');
        }

        return updatedRole;
    }

    async deleteRole(appId: number, roleId: number): Promise<void> {
        const [existingRole, hasUsers] = await Promise.all([
            this.appRolesRepository.existsByIdInApp(appId, roleId),
            this.appRolesRepository.hasUsers(roleId),
        ]);

        if (!existingRole) {
            throw new NotFoundException('Role not found');
        }

        if (hasUsers) {
            throw new ConflictException('Cannot delete role that is assigned to users');
        }

        await this.appRolesRepository.delete(roleId);
    }
}
