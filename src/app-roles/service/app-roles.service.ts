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

    private async validateAppAccessByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceIsGod: boolean,
    ): Promise<ApplicationModel> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!serviceIsGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

        return app;
    }

    private async validateAppAccessByAppUser(appId: number, appIdFromToken: number): Promise<ApplicationModel> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (appId !== appIdFromToken) {
            throw new ForbiddenException('Can only access users of application');
        }

        return app;
    }

    async createRoleByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceIsGod: boolean,
        name: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceIsGod);
        return this.createRole(appId, name, description, permissionIds);
    }

    async createRoleByAppUser(
        appId: number,
        appIdFromToken: number,
        name: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.createRole(appId, name, description, permissionIds);
    }

    private async createRole(
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

    async getAllRolesByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceIsGod: boolean,
    ): Promise<ApplicationRoleModel[]> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceIsGod);
        return this.appRolesRepository.findAllByApp(appId);
    }

    async getAllRolesByAppUser(appId: number, appIdFromToken: number): Promise<ApplicationRoleModel[]> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.appRolesRepository.findAllByApp(appId);
    }

    async getRoleByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceIsGod: boolean,
        roleId: number,
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceIsGod);
        return this.getRole(appId, roleId);
    }

    async getRoleByAppUser(
        appId: number,
        appIdFromToken: number,
        roleId: number,
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.getRole(appId, roleId);
    }

    private async getRole(appId: number, roleId: number): Promise<ApplicationRoleWithPermissionsModel> {
        const role = await this.appRolesRepository.findByIdWithPermissionsInApp(appId, roleId);

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async updateRoleByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceIsGod: boolean,
        roleId: number,
        name?: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceIsGod);
        return this.updateRole(appId, roleId, name, description, permissionIds);
    }

    async updateRoleByAppUser(
        appId: number,
        appIdFromToken: number,
        roleId: number,
        name?: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.updateRole(appId, roleId, name, description, permissionIds);
    }

    private async updateRole(
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

    async deleteRoleByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceIsGod: boolean,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceIsGod);
        await this.deleteRole(appId, roleId);
    }

    async deleteRoleByAppUser(appId: number, appIdFromToken: number, roleId: number): Promise<void> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        await this.deleteRole(appId, roleId);
    }

    private async deleteRole(appId: number, roleId: number): Promise<void> {
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
