import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';
import { ApplicationModel } from 'src/database/models/application.model';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';

@Injectable()
export class AppRolesService {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly appRolesRepository: AppRolesRepository,
        private readonly appPermissionsRepository: AppPermissionsRepository,
        private readonly appUsersRepository: AppUsersRepository,
        private readonly serviceUsersRepository: ServiceUsersRepository,
    ) {}

    private async validateAppExists(appId: number): Promise<ApplicationModel> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        return app;
    }

    private async validateAppAccessByServiceUser(appId: number, serviceUserId: number): Promise<ApplicationModel> {
        const user = await this.serviceUsersRepository.findById(serviceUserId);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const app = await this.validateAppExists(appId);

        if (!user.isGod && app.ownerId !== user.id) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

        return app;
    }

    private async validateAppAccessByAppUser(appId: number, appUserId: number): Promise<ApplicationModel> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const app = await this.validateAppExists(appId);

        return app;
    }

    async createRoleByServiceUser(
        appId: number,
        serviceUserId: number,
        name: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId);
        return this.createRole(appId, name, description, permissionIds);
    }

    async createRoleByAppUser(
        appId: number,
        appUserId: number,
        name: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appUserId);
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

    async getAllRolesByServiceUser(appId: number, serviceUserId: number): Promise<ApplicationRoleModel[]> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId);
        return this.appRolesRepository.findAllByApp(appId);
    }

    async getAllRolesByAppUser(appId: number, appUserId: number): Promise<ApplicationRoleModel[]> {
        await this.validateAppAccessByAppUser(appId, appUserId);
        return this.appRolesRepository.findAllByApp(appId);
    }

    async getRoleByServiceUser(
        appId: number,
        serviceUserId: number,
        roleId: number,
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId);
        return this.getRole(appId, roleId);
    }

    async getRoleByAppUser(
        appId: number,
        appUserId: number,
        roleId: number,
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appUserId);
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
        roleId: number,
        name?: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId);
        return this.updateRole(appId, roleId, name, description, permissionIds);
    }

    async updateRoleByAppUser(
        appId: number,
        appUserId: number,
        roleId: number,
        name?: string,
        description?: string,
        permissionIds?: number[],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appUserId);
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

    async deleteRoleByServiceUser(appId: number, serviceUserId: number, roleId: number): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId);
        await this.deleteRole(appId, roleId);
    }

    async deleteRoleByAppUser(appId: number, appUserId: number, roleId: number): Promise<void> {
        await this.validateAppAccessByAppUser(appId, appUserId);
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
