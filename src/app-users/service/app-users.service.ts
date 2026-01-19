import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { ApplicationUserModel } from 'src/database/models/application-user.model';
import {
    ApplicationUserWithRolesAndPermissionsModel,
    ApplicationUserWithRolesModel,
} from 'src/types/application-user.types';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';
import { ApplicationModel } from 'src/database/models/application.model';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';

@Injectable()
export class AppUsersService {
    constructor(
        private readonly appUsersRepository: AppUsersRepository,
        private readonly appRolesRepository: AppRolesRepository,
        private readonly appsRepository: AppsRepository,
    ) {}

    private async validateAppAccessByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
    ): Promise<ApplicationModel> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!serviceUserIsGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('Can only access own applications or required god-mode');
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

    async listAppUsersByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        roleId?: number,
    ): Promise<ApplicationUserWithRolesModel[]> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        return this.listAppUsers(appId, roleId);
    }

    async listAppUsersByAppUser(
        appId: number,
        appIdFromToken: number,
        roleId?: number,
    ): Promise<ApplicationUserWithRolesModel[]> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.listAppUsers(appId, roleId);
    }

    private async listAppUsers(appId: number, roleId?: number): Promise<ApplicationUserWithRolesModel[]> {
        if (roleId) {
            return this.appUsersRepository.findUsersByRoleWithRoles(appId, roleId);
        }

        return this.appUsersRepository.findAllByAppWithRoles(appId);
    }

    async getAppUserByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        appUserId: number,
    ): Promise<ApplicationUserWithRolesAndPermissionsModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        return this.getAppUser(appId, appUserId);
    }

    async getAppUserByAppUser(
        appId: number,
        appIdFromToken: number,
        appUserId: number,
    ): Promise<ApplicationUserWithRolesAndPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.getAppUser(appId, appUserId);
    }

    private async getAppUser(appId: number, appUserId: number): Promise<ApplicationUserWithRolesAndPermissionsModel> {
        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        return user;
    }

    async updateAppUserByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        appUserId: number,
        email: string,
    ): Promise<ApplicationUserModel> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        return this.updateAppUser(appId, appUserId, email);
    }

    async updateAppUserByAppUser(
        appId: number,
        appIdFromToken: number,
        appUserId: number,
        email: string,
    ): Promise<ApplicationUserModel> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.updateAppUser(appId, appUserId, email);
    }

    private async updateAppUser(appId: number, appUserId: number, email: string): Promise<ApplicationUserModel> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        if (email === user.email) {
            return user;
        }

        const existingUser = await this.appUsersRepository.findByEmailInApp(appId, email);
        if (existingUser) {
            throw new ConflictException('Email already exists in this application');
        }

        const updated = await this.appUsersRepository.update(appUserId, { email });

        if (!updated) {
            throw new NotFoundException('User not found');
        }

        return updated;
    }

    async deleteAppUserByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        appUserId: number,
    ): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        await this.deleteAppUser(appId, appUserId);
    }

    async deleteAppUserByAppUser(appId: number, appIdFromToken: number, appUserId: number): Promise<void> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        await this.deleteAppUser(appId, appUserId);
    }

    private async deleteAppUser(appId: number, appUserId: number): Promise<void> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        await this.appUsersRepository.delete(appUserId);
    }

    async getAppUserRolesByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        appUserId: number,
    ): Promise<ApplicationRoleWithPermissionsModel[]> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        return this.getAppUserRoles(appId, appUserId);
    }

    async getAppUserRolesByAppUser(
        appId: number,
        appIdFromToken: number,
        appUserId: number,
    ): Promise<ApplicationRoleWithPermissionsModel[]> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.getAppUserRoles(appId, appUserId);
    }

    private async getAppUserRoles(appId: number, appUserId: number): Promise<ApplicationRoleWithPermissionsModel[]> {
        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        return user.roles;
    }

    async addRoleToAppUserByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        return this.addRoleToAppUser(appId, appUserId, roleId);
    }

    async addRoleToAppUserByAppUser(
        appId: number,
        appIdFromToken: number,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        return this.addRoleToAppUser(appId, appUserId, roleId);
    }

    private async addRoleToAppUser(appId: number, appUserId: number, roleId: number): Promise<void> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        const role = await this.appRolesRepository.findByIdInApp(appId, roleId);
        if (!role) {
            throw new NotFoundException('Role not found in this application');
        }

        const hasRole = await this.appUsersRepository.hasRole(appUserId, roleId);
        if (hasRole) {
            throw new ConflictException('User already has this role');
        }

        await this.appUsersRepository.addRole(appUserId, roleId);
    }

    async removeRoleFromAppUserByServiceUser(
        appId: number,
        serviceUserId: number,
        serviceUserIsGod: boolean,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, serviceUserId, serviceUserIsGod);
        await this.removeRoleFromAppUser(appId, appUserId, roleId);
    }

    async removeRoleFromAppUserByAppUser(
        appId: number,
        appIdFromToken: number,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByAppUser(appId, appIdFromToken);
        await this.removeRoleFromAppUser(appId, appUserId, roleId);
    }

    private async removeRoleFromAppUser(appId: number, appUserId: number, roleId: number): Promise<void> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        const hasRole = await this.appUsersRepository.hasRole(appUserId, roleId);
        if (!hasRole) {
            throw new NotFoundException('User does not have this role');
        }

        await this.appUsersRepository.removeRole(appUserId, roleId);
    }
}
