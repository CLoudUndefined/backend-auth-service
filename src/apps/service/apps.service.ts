import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { EncryptionService } from 'src/encryption/encryption.service';
import * as crypto from 'crypto';
import { ApplicationWithOwnerModel } from 'src/types/application.types';

@Injectable()
export class AppsService {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly encryptionService: EncryptionService,
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
        userId: number,
        isGod: boolean,
    ): Promise<ApplicationWithOwnerModel> {
        const app = await this.validateAppExists(appId);

        if (!isGod && app.ownerId !== userId) {
            throw new ForbiddenException('Can only access own applications or required god-mode');
        }

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

    async findAppByIdByAppUser(appId: number): Promise<ApplicationWithOwnerModel> {
        return this.validateAppExists(appId);
    }

    async findAppByIdByServiceUser(appId: number, userId: number, isGod: boolean): Promise<ApplicationWithOwnerModel> {
        return this.validateAppAccessByServiceUser(appId, userId, isGod);
    }

    async updateByAppUser(appId: number, name?: string, description?: string): Promise<ApplicationWithOwnerModel> {
        await this.validateAppExists(appId);
        return this.update(appId, name, description);
    }

    async updateByServiceUser(
        appId: number,
        userId: number,
        isGod: boolean,
        name?: string,
        description?: string,
    ): Promise<ApplicationWithOwnerModel> {
        await this.validateAppAccessByServiceUser(appId, userId, isGod);
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

    async deleteByServiceUser(appId: number, userId: number, isGod: boolean): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, userId, isGod);
        await this.appsRepository.delete(appId);
    }

    async regenerateSecretByServiceUser(appId: number, userId: number, isGod: boolean): Promise<void> {
        await this.validateAppAccessByServiceUser(appId, userId, isGod);

        const updatedApp = await this.appsRepository.updateWithOwner(appId, {
            encryptedSecret: this.generateEncryptedSecret(),
        });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }
    }
}
