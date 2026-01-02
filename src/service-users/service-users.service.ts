import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import * as bcrypt from 'bcrypt';
import type { ServiceUserModel } from 'src/database/models/service-user.model';
import { ServiceUserRefreshTokenModel } from 'src/database/models/service-user-refresh-token.model';
import { ServiceUserRecoveryModel } from 'src/database/models/service-user-recovery.model';

@Injectable()
export class ServiceUsersService {
    constructor(private readonly serviceUsersRepository: ServiceUsersRepository) {}

    async create(email: string, plainPassword: string): Promise<ServiceUserModel> {
        const existingUser = await this.existsByEmail(email);

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        return this.serviceUsersRepository.create(email, passwordHash, false);
    }

    async findByEmail(email: string): Promise<ServiceUserModel | undefined> {
        return this.serviceUsersRepository.findByEmail(email);
    }

    async findByEmailOrThrow(email: string): Promise<ServiceUserModel> {
        const user = await this.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async findById(id: number): Promise<ServiceUserModel | undefined> {
        return this.serviceUsersRepository.findById(id);
    }

    async findByIdOrThrow(id: number): Promise<ServiceUserModel> {
        const user = await this.findById(id);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async createRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
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
        return this.serviceUsersRepository.findRefreshTokenByHash(tokenHash);
    }

    async createRecovery(userId: number, question: string, answerHash: string): Promise<void> {
        await this.serviceUsersRepository.createRecovery(userId, question, answerHash);
    }

    async findRecoveriesByUserId(userId: number): Promise<ServiceUserRecoveryModel[]> {
        return this.serviceUsersRepository.findRecoveriesByUserId(userId);
    }

    async findRecoveryById(id: number): Promise<ServiceUserRecoveryModel | undefined> {
        return this.serviceUsersRepository.findRecoveryById(id);
    }

    async findRecoveryByIdOrThrow(id: number): Promise<ServiceUserRecoveryModel> {
        const recovery = await this.serviceUsersRepository.findRecoveryById(id);

        if (!recovery) {
            throw new NotFoundException('Invalid credentials');
        }

        return recovery;
    }

    async updateRecovery(id: number, question: string, answerHash: string): Promise<void> {
        await this.serviceUsersRepository.updateRecovery(id, { question, answerHash });
    }

    async deleteRecovery(id: number): Promise<void> {
        await this.serviceUsersRepository.deleteRecovery(id);
    }

    async existsByEmail(email: string): Promise<boolean> {
        return this.serviceUsersRepository.existsByEmail(email);
    }
}
