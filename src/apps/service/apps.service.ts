import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { EncryptionService } from 'src/encryption/encryption.service';
import * as crypto from 'crypto';
import { ApplicationWithOwnerModel } from 'src/types/application.types';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';

@Injectable()
export class AppsService {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly encryptionService: EncryptionService,
        private readonly appUsersRepository: AppUsersRepository,
        private readonly serviceUsersRepository: ServiceUsersRepository,
    ) {}

    private generateEncryptedSecret(): string {
        return this.encryptionService.encrypt(crypto.randomBytes(64).toString('hex'));
    }

    private async validateAppExists(appId: number): Promise<ApplicationWithOwnerModel> {
        const app = await this.appsRepository.findByIdWithOwner(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        return app;
    }

    private async validateAppAccessByServiceUser(
        appId: number,
        serviceUserId: number,
    ): Promise<ApplicationWithOwnerModel> {
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

    private async validateAppAccessByAppUser(appId: number, appUserId: number): Promise<ApplicationWithOwnerModel> {
        const user = await this.appUsersRepository.findByIdInApp(appId, appUserId);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const app = await this.validateAppExists(appId);

        return app;
    }

    async createByServiceUser(ownerId: number, name: string, description?: string): Promise<ApplicationWithOwnerModel> {
        const isAppExist = await this.appsRepository.exists(ownerId, name);

        if (isAppExist) {
            throw new ConflictException('Application with this name already exists');
        }

        const app = await this.appsRepository.createWithOwner(
            ownerId,
            name,
            this.generateEncryptedSecret(),
            description,
        );

        return app;
    }

    async findAllAppsByServiceUser(): Promise<ApplicationWithOwnerModel[]> {
        return this.appsRepository.findAllWithOwner();
    }

    async findAppByIdByAppUser(appId: number, appUserId: number): Promise<ApplicationWithOwnerModel> {
        return this.validateAppAccessByAppUser(appId, appUserId);
    }

    async findAppByIdByServiceUser(appId: number, userId: number): Promise<ApplicationWithOwnerModel> {
        return this.validateAppAccessByServiceUser(appId, userId);
    }

    async updateByAppUser(
        appId: number,
        appUserId: number,
        name?: string,
        description?: string,
    ): Promise<ApplicationWithOwnerModel> {
        await this.validateAppAccessByAppUser(appId, appUserId);
        return this.update(appId, name, description);
    }

    async updateByServiceUser(
        appId: number,
        userId: number,
        name?: string,
        description?: string,
    ): Promise<ApplicationWithOwnerModel> {
        await this.validateAppAccessByServiceUser(appId, userId);
        return this.update(appId, name, description);
    }

    private async update(appId: number, name?: string, description?: string): Promise<ApplicationWithOwnerModel> {
        if (!description && !name) {
            throw new BadRequestException('At least one field (name or description) must be provided');
        }

        const updatedApp = await this.appsRepository.updateWithOwner(appId, { name, description });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }

        return updatedApp;
    }

    async deleteByServiceUser(appId: number, userId: number): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, userId);
        await this.appsRepository.delete(appId);
    }

    async regenerateSecretByServiceUser(appId: number, userId: number): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, userId);

        const updatedApp = await this.appsRepository.updateWithOwner(appId, {
            encryptedSecret: this.generateEncryptedSecret(),
        });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }
    }
}
