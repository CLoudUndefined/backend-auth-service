import { ConflictException, Injectable } from '@nestjs/common';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import * as bcrypt from 'bcrypt';
import type { ServiceUserModel } from 'src/database/models/service-user.model';
import { ServiceUserRefreshTokenModel } from 'src/database/models/service-user-refresh-token.model';
import { ServiceUserRecoveryModel } from 'src/database/models/service-user-recovery.model';

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

    async saveRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
        await this.serviceUsersRepository.createRefreshToken(userId, tokenHash, expiresAt);
    }

    async updatePassword(userId: number, passwordHash: string): Promise<void> {
        await this.serviceUsersRepository.update(userId, { passwordHash });
    }

    async deleteRefreshTokenById(id: number): Promise<void> {
        await this.serviceUsersRepository.deleteRefreshToken(id);
    }

    async deleteAllRefreshTokens(userId: number): Promise<void> {
        await this.serviceUsersRepository.deleteAllUserRefreshTokens(userId);
    }

    async findRefreshTokenByHash(tokenHash: string): Promise<ServiceUserRefreshTokenModel | undefined> {
        return await this.serviceUsersRepository.findRefreshTokenByHash(tokenHash);
    }

    async saveRecovery(userId: number, question: string, answerHash: string): Promise<void> {
        await this.serviceUsersRepository.createRecovery(userId, question, answerHash);
    }

    async findRecoveriesByUserId(userId: number): Promise<ServiceUserRecoveryModel[]> {
        return await this.serviceUsersRepository.findRecoveriesByUserId(userId);
    }

    async findRecoveryById(id: number): Promise<ServiceUserRecoveryModel | undefined> {
        return await this.serviceUsersRepository.findRecoveryById(id);
    }

    async updateRecovery(id: number, question: string, answerHash: string): Promise<void> {
        await this.serviceUsersRepository.updateRecovery(id, { question, answerHash });
    }

    async deleteRecovery(id: number): Promise<void> {
        await this.serviceUsersRepository.deleteRecovery(id);
    }
}
