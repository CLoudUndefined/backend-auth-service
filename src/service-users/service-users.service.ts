import { ConflictException, Injectable } from '@nestjs/common';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import * as bcrypt from 'bcrypt';
import type { ServiceUserModel } from 'src/database/models/service-user.model';

@Injectable()
export class ServiceUsersService {
    constructor(private readonly serviceUsersRepository: ServiceUsersRepository) {}

    async create(email: string, plainPassword: string): Promise<ServiceUserModel> {
        const existingUser = await this.serviceUsersRepository.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        return await this.serviceUsersRepository.create(email, passwordHash, false);
    }

    async findByEmail(email: string): Promise<ServiceUserModel | undefined> {
        return await this.serviceUsersRepository.findByEmail(email);
    }

    async findById(id: number): Promise<ServiceUserModel | undefined> {
        return await this.serviceUsersRepository.findById(id);
    }

    async saveRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
        const tokenHash = await bcrypt.hash(token, 10);

        await this.serviceUsersRepository.createRefreshToken(userId, tokenHash, expiresAt);
    }

    async updatePassword(userId: number, passwordHash: string): Promise<void> {
        await this.serviceUsersRepository.update(userId, { passwordHash });
    }

    async deleteAllRefreshTokens(userId: number): Promise<void> {
        await this.serviceUsersRepository.deleteAllUserRefreshTokens(userId);
    }
}
