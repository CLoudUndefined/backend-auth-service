import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { EncryptionService } from 'src/common/encryption/encryption.service';
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

    async createApp(ownerId: number, name: string, description?: string): Promise<ApplicationWithOwnerModel> {
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

    async findAllApps(): Promise<ApplicationWithOwnerModel[]> {
        return this.appsRepository.findAllWithOwner();
    }

    async findAppById(appId: number): Promise<ApplicationWithOwnerModel> {
        const app = await this.appsRepository.findByIdWithOwner(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        return app;
    }

    async updateApp(appId: number, name?: string, description?: string): Promise<ApplicationWithOwnerModel> {
        if (!description && !name) {
            throw new BadRequestException('At least one field (name or description) must be provided');
        }

        const updatedApp = await this.appsRepository.updateWithOwner(appId, { name, description });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }

        return updatedApp;
    }

    async deleteApp(appId: number): Promise<void> {
        await this.appsRepository.delete(appId);
    }

    async regenerateSecret(appId: number): Promise<void> {
        const updatedApp = await this.appsRepository.updateWithOwner(appId, {
            encryptedSecret: this.generateEncryptedSecret(),
        });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }
    }
}
