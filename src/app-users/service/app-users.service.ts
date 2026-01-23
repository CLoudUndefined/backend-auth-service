import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

    private async validateAppExists(appId: number): Promise<ApplicationModel> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
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

    async listAppUsersByAppUser(
        appId: number,
        authenticatedAppUserId: number,
        roleId?: number,
    ): Promise<ApplicationUserWithRolesModel[]> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        return this.listAppUsers(appId, roleId);
    }

    async listAppUsers(appId: number, roleId?: number): Promise<ApplicationUserWithRolesModel[]> {
        if (roleId) {
            return this.appUsersRepository.findUsersByRoleWithRoles(appId, roleId);
        }

        return this.appUsersRepository.findAllByAppWithRoles(appId);
    }

    async getAppUserByAppUser(
        appId: number,
        authenticatedAppUserId: number,
        appUserId: number,
    ): Promise<ApplicationUserWithRolesAndPermissionsModel> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        return this.getAppUser(appId, appUserId);
    }

    async getAppUser(appId: number, appUserId: number): Promise<ApplicationUserWithRolesAndPermissionsModel> {
        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        return user;
    }

    async updateAppUserByAppUser(
        appId: number,
        authenticatedAppUserId: number,
        appUserId: number,
        email: string,
    ): Promise<ApplicationUserModel> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        return this.updateAppUser(appId, appUserId, email);
    }

    async updateAppUser(appId: number, appUserId: number, email: string): Promise<ApplicationUserModel> {
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

    async deleteAppUserByAppUser(appId: number, authenticatedAppUserId: number, appUserId: number): Promise<void> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        await this.deleteAppUser(appId, appUserId);
    }

    async deleteAppUser(appId: number, appUserId: number): Promise<void> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        await this.appUsersRepository.delete(appUserId);
    }

    async getAppUserRolesByAppUser(
        appId: number,
        authenticatedAppUserId: number,
        appUserId: number,
    ): Promise<ApplicationRoleWithPermissionsModel[]> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        return this.getAppUserRoles(appId, appUserId);
    }

    async getAppUserRoles(appId: number, appUserId: number): Promise<ApplicationRoleWithPermissionsModel[]> {
        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);
        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        return user.roles;
    }

    async addRoleToAppUserByAppUser(
        appId: number,
        authenticatedAppUserId: number,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        return this.addRoleToAppUser(appId, appUserId, roleId);
    }

    async addRoleToAppUser(appId: number, appUserId: number, roleId: number): Promise<void> {
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

    async removeRoleFromAppUserByAppUser(
        appId: number,
        authenticatedAppUserId: number,
        appUserId: number,
        roleId: number,
    ): Promise<void> {
        await this.validateAppAccessByAppUser(appId, authenticatedAppUserId);
        await this.removeRoleFromAppUser(appId, appUserId, roleId);
    }

    async removeRoleFromAppUser(appId: number, appUserId: number, roleId: number): Promise<void> {
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
