import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { CreateAppRequestDto } from './dto/create-app-request.dto';
import { EncryptionService } from 'src/encryption/encryption.service';
import * as crypto from 'crypto';
import { ApplicationWithOwnerModel } from 'src/types/application.types';
import { UpdateAppRequestDto } from './dto/update-app-request.dto';

@Injectable()
export class AppsService {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly encryptionService: EncryptionService,
    ) {}

    async create(ownerId: number, createAppDto: CreateAppRequestDto): Promise<ApplicationWithOwnerModel> {
        const isAppExist = await this.appsRepository.exists(ownerId, createAppDto.name);

        if (isAppExist) {
            throw new ConflictException('Application with this name already exists');
        }

        const secret = crypto.randomBytes(64).toString('hex');
        const encryptedSecret = this.encryptionService.encrypt(secret);

        const description = createAppDto.description ?? '';
        const app = await this.appsRepository.createWithOwner(ownerId, createAppDto.name, encryptedSecret, description);

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
        updateApp: UpdateAppRequestDto,
    ): Promise<ApplicationWithOwnerModel> {
        const app = await this.appsRepository.findByIdWithOwner(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== userId) {
            throw new ForbiddenException('Can only access own application or required god-mode');
        }

        if (!updateApp.description && !updateApp.name) {
            throw new BadRequestException('At least one field (name or description) must be provided');
        }

        const updatedApp = await this.appsRepository.updateWithOwner(appId, updateApp);

        if (!updatedApp) {
            throw new NotFoundException('Application not found');
        }

        return updatedApp;
    }

    async delete(userId: number, isGod: boolean, appId: number): Promise<void> {
        const app = await this.appsRepository.findByIdWithOwner(appId);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!isGod && app.ownerId !== userId) {
            throw new ForbiddenException('Can only access own application or required god-mode');
        }

        await this.appsRepository.delete(appId);
    }
}
