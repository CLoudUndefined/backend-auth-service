import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import type { ServiceUserModel } from 'src/database/models/service-user.model';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ApplicationWithOwnerModel } from 'src/types/application.types';

@Injectable()
export class ServiceUsersService {
    constructor(
        private readonly serviceUsersRepository: ServiceUsersRepository,
        private readonly appsRepository: AppsRepository,
    ) {}

    async update(id: number, email: string): Promise<ServiceUserModel> {
        const existingUser = await this.serviceUsersRepository.findByEmail(email);

        if (existingUser && existingUser.id !== id) {
            throw new ConflictException('Email already in use');
        }

        const updated = await this.serviceUsersRepository.update(id, { email });

        if (!updated) {
            throw new NotFoundException('User not found');
        }

        return updated;
    }

    async delete(id: number): Promise<void> {
        await this.findByIdOrThrow(id);

        const hasApps = await this.appsRepository.existsByOwnerId(id);
        if (hasApps) {
            throw new ConflictException('Cannot delete user with existing applications');
        }

        await this.serviceUsersRepository.delete(id);
    }

    async findByIdOrThrow(id: number): Promise<ServiceUserModel> {
        const user = await this.serviceUsersRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findAll(): Promise<ServiceUserModel[]> {
        return this.serviceUsersRepository.findAll();
    }

    async findAllAppsByOwnerId(id: number): Promise<ApplicationWithOwnerModel[]> {
        return this.appsRepository.findAllByOwnerIdWithOwner(id);
    }
}
