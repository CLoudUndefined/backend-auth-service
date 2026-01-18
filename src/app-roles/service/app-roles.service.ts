import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';
import { ApplicationModel } from 'src/database/models/application.model';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';

@Injectable()
export class AppRolesService {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly appRolesRepository: AppRolesRepository,
        private readonly appPermissionsRepository: AppPermissionsRepository,
    ) {}

    private async validateAppAccess(appId: number, serviceUserId: number, isGod: boolean): Promise<ApplicationModel> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

        return app;
    }

    async createRole(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        name: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

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

    async getAllRoles(appId: number, serviceUserId: number, isGod: boolean): Promise<ApplicationRoleModel[]> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

        return this.appRolesRepository.findAllByApp(appId);
    }

    async getRole(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        roleId: number,
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

        const role = await this.appRolesRepository.findByIdWithPermissionsInApp(appId, roleId);

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async updateRole(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        roleId: number,
        name?: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

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

    async deleteRole(appId: number, serviceUserId: number, isGod: boolean, roleId: number): Promise<void> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

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
