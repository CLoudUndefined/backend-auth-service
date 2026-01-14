import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly serviceUsersRepository: ServiceUsersRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    private async verifyCredentialOrThrow(stringPlain: string, stringHash: string): Promise<void> {
        const isValid = await bcrypt.compare(stringPlain, stringHash);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async register(email: string, plainPassword: string): Promise<ServiceUserModel> {
        const existingUser = await this.serviceUsersRepository.existsByEmail(email);

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        return this.serviceUsersRepository.create(email, passwordHash, false);
    }

    async login(email: string, plainPassword: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.serviceUsersRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        await this.verifyCredentialOrThrow(plainPassword, user.passwordHash);

        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            isGod: user.isGod,
        });

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        await this.serviceUsersRepository.createRefreshToken(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + ms(this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'))),
        );

        return { accessToken, refreshToken };
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.serviceUsersRepository.findById(userId);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (oldPassword === newPassword) {
            throw new BadRequestException('New password must be different');
        }

        await this.verifyCredentialOrThrow(oldPassword, user.passwordHash);

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await this.serviceUsersRepository.update(userId, { passwordHash: newPasswordHash });

        await this.serviceUsersRepository.deleteAllUserRefreshTokens(userId);
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const storedToken = await this.serviceUsersRepository.findRefreshTokenByHash(tokenHash);

        if (!storedToken) {
            throw new NotFoundException('Invalid refresh token');
        }

        if (new Date() > storedToken.expiresAt) {
            await this.serviceUsersRepository.deleteRefreshToken(storedToken.id);
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = await this.serviceUsersRepository.findById(storedToken.userId);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            isGod: user.isGod,
        });

        await this.serviceUsersRepository.deleteRefreshToken(storedToken.id);

        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        await this.serviceUsersRepository.createRefreshToken(
            user.id,
            newRefreshTokenHash,
            new Date(Date.now() + ms(this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'))),
        );

        return { accessToken, refreshToken: newRefreshToken };
    }

    async addRecovery(userId: number, recoveryQuestion: string, recoveryAnswer: string): Promise<void> {
        const answerHash = await bcrypt.hash(recoveryAnswer, 10);

        await this.serviceUsersRepository.createRecovery(userId, recoveryQuestion, answerHash);
    }

    async listRecovery(userId: number): Promise<{ questions: { id: number; question: string }[] }> {
        const recoveries = await this.serviceUsersRepository.findRecoveriesByUserId(userId);

        return {
            questions: recoveries.map((recovery) => {
                return { id: recovery.id, question: recovery.question };
            }),
        };
    }

    async askRecoveryQuestions(email: string): Promise<{ questions: { id: number; question: string }[] }> {
        const user = await this.serviceUsersRepository.findByEmail(email);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const recoveries = await this.serviceUsersRepository.findRecoveriesByUserId(user.id);

        return {
            questions: recoveries.map((recovery) => {
                return { id: recovery.id, question: recovery.question };
            }),
        };
    }

    async resetPasswordByRecovery(
        recoveryId: number,
        email: string,
        recoveryAnswer: string,
        newPassword: string,
    ): Promise<void> {
        const [user, recovery] = await Promise.all([
            this.serviceUsersRepository.findByEmail(email),
            this.serviceUsersRepository.findRecoveryById(recoveryId),
        ]);

        if (!user || !recovery) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('This recovery question does not belong to this user');
        }

        await this.verifyCredentialOrThrow(recoveryAnswer, recovery.answerHash);

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await this.serviceUsersRepository.update(user.id, { passwordHash: newPasswordHash });

        await this.serviceUsersRepository.deleteAllUserRefreshTokens(user.id);
    }

    async updateRecovery(
        userId: number,
        recoveryId: number,
        currentPassword: string,
        newRecoveryQuestion: string,
        newRecoveryAnswer: string,
    ): Promise<void> {
        const [user, recovery] = await Promise.all([
            this.serviceUsersRepository.findById(userId),
            this.serviceUsersRepository.findRecoveryById(recoveryId),
        ]);

        if (!user || !recovery) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('Recovery question not found');
        }

        await this.verifyCredentialOrThrow(currentPassword, user.passwordHash);

        const newAnswerHash = await bcrypt.hash(newRecoveryAnswer, 10);

        await this.serviceUsersRepository.updateRecovery(recoveryId, {
            question: newRecoveryQuestion,
            answerHash: newAnswerHash,
        });
    }

    async removeRecovery(userId: number, recoveryId: number, currentPassword: string): Promise<void> {
        const [user, recovery] = await Promise.all([
            this.serviceUsersRepository.findById(userId),
            this.serviceUsersRepository.findRecoveryById(recoveryId),
        ]);

        if (!user || !recovery) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('Recovery question not found');
        }

        await this.verifyCredentialOrThrow(currentPassword, user.passwordHash);

        await this.serviceUsersRepository.deleteRecovery(recoveryId);
    }
}
