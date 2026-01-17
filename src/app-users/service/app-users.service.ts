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

    async listUsers(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        roleId?: number,
    ): Promise<ApplicationUserWithRolesModel[]> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

        if (roleId) {
            return this.appUsersRepository.findUsersByRoleWithRoles(appId, roleId);
        }

        return this.appUsersRepository.findAllByAppWithRoles(appId);
    }

    async getUser(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        appUserId: number,
    ): Promise<ApplicationUserWithRolesAndPermissionsModel> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        return user;
    }

    async updateUser(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        appUserId: number,
        email: string,
    ): Promise<ApplicationUserModel> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

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

    async deleteUser(appId: number, serviceUserId: number, isGod: boolean, appUserId: number): Promise<void> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        await this.appUsersRepository.delete(appUserId);
    }

    async getUserRoles(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        appUserId: number,
    ): Promise<ApplicationRoleWithPermissionsModel[]> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        return user.roles;
    }

    async addRoleToUser(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

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

    async removeRoleFromUser(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccess(appId, serviceUserId, isGod);

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
