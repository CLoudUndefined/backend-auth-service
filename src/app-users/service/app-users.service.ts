import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { ApplicationUserModel } from 'src/database/models/application-user.model';
import {
    ApplicationUserWithRolesAndPermissionsModel,
    ApplicationUserWithRolesModel,
} from 'src/types/application-user.types';
import { AppsRepository } from 'src/database/repositories/apps.repository';

@Injectable()
export class AppUsersService {
    constructor(
        private readonly appUsersRepository: AppUsersRepository,
        private readonly appsRepository: AppsRepository,
    ) {}
    async findById(userId: number): Promise<ApplicationUserModel | undefined> {
        return this.appUsersRepository.findById(userId);
    }

    async listUsers(
        appId: number,
        serviceUserId: number,
        isGod: boolean,
        roleId?: number,
    ): Promise<ApplicationUserWithRolesModel[]> {
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

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
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

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
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        if (email === user.email) {
            throw new ConflictException('Email already in use');
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
        const app = await this.appsRepository.findById(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== serviceUserId) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

        const user = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId);

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        await this.appUsersRepository.delete(appUserId);
    }
}
