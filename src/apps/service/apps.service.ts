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

    async create(ownerId: number, name: string, description?: string): Promise<ApplicationWithOwnerModel> {
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

    async findAppById(userId: number, isGod: boolean, appId: number): Promise<ApplicationWithOwnerModel> {
        const app = await this.appsRepository.findByIdWithOwner(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== userId) {
            throw new ForbiddenException('Can only access own applications or required god-mode');
        }

        return app;
    }

    async update(
        userId: number,
        isGod: boolean,
        appId: number,
        name?: string,
        description?: string,
    ): Promise<ApplicationWithOwnerModel> {
        await this.findAppById(userId, isGod, appId);

        if (!description && !name) {
            throw new BadRequestException('At least one field (name or description) must be provided');
        }

        const updatedApp = await this.appsRepository.updateWithOwner(appId, { name, description });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }

        return updatedApp;
    }

    async delete(userId: number, isGod: boolean, appId: number): Promise<void> {
        await this.findAppById(userId, isGod, appId);
        await this.appsRepository.delete(appId);
    }

    async regenerateSecret(userId: number, isGod: boolean, appId: number): Promise<void> {
        await this.findAppById(userId, isGod, appId);

        const updatedApp = await this.appsRepository.updateWithOwner(appId, {
            encryptedSecret: this.generateEncryptedSecret(),
        });

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }
    }
}
