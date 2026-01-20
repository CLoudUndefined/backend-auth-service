import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApplicationUserModel } from 'src/database/models/application-user.model';
import { AuthTokensDto } from 'src/common/service/dto/auth/auth-tokens.dto';
import { JwtService } from '@nestjs/jwt';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { RecoveryQuestionListDto } from 'src/common/service/dto/auth/recovery-question-list.dto';

@Injectable()
export class AppAuthService {
    constructor(
        private readonly appUsersRepository: AppUsersRepository,
        private readonly appsRepository: AppsRepository,
        private readonly configService: ConfigService,
        private readonly encryptionService: EncryptionService,
        private readonly jwtService: JwtService,
    ) {}

    private async verifyCredentialOrThrow(stringPlain: string, stringHash: string): Promise<void> {
        const isValid = await bcrypt.compare(stringPlain, stringHash);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async register(
        appId: number,
        email: string,
        plainPassword: string,
        recoveryQuestion?: string,
        recoveryAnswer?: string,
    ): Promise<ApplicationUserModel> {
        const [app, existingUser] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.exists(appId, email),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const user = await this.appUsersRepository.create(appId, email, passwordHash);

        if (recoveryQuestion && recoveryAnswer) {
            const answerHash = await bcrypt.hash(recoveryAnswer, 10);
            await this.appUsersRepository.createRecovery(user.id, recoveryQuestion, answerHash);
        }

        return user;
    }

    async login(appId: number, email: string, plainPassword: string): Promise<AuthTokensDto> {
        const [app, user] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByEmailInApp(appId, email),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        await this.verifyCredentialOrThrow(plainPassword, user.passwordHash);

        const accessToken = this.jwtService.sign(
            { appId, sub: user.id },
            { secret: this.encryptionService.decrypt(app.encryptedSecret) },
        );

        const refreshToken = this.jwtService.sign(
            { appId, sub: user.id },
            {
                secret: this.encryptionService.decrypt(app.encryptedSecret),
                expiresIn: this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
            },
        );
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        await this.appUsersRepository.createRefreshToken(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + ms(this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'))),
        );

        return { accessToken, refreshToken };
    }

    async changePassword(appId: number, userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const [app, user] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByIdInApp(appId, userId),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (oldPassword === newPassword) {
            throw new BadRequestException('New password must be different');
        }

        await this.verifyCredentialOrThrow(oldPassword, user.passwordHash);

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await this.appUsersRepository.update(userId, { passwordHash: newPasswordHash });

        await this.appUsersRepository.deleteAllUserRefreshTokens(userId);
    }

    async refreshToken(appId: number, refreshToken: string): Promise<AuthTokensDto> {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const [app, storedToken] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findRefreshTokenByHash(tokenHash),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.appUsersRepository.findByIdInApp(appId, storedToken.userId);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        const accessToken = this.jwtService.sign(
            { appId, sub: user.id },
            { secret: this.encryptionService.decrypt(app.encryptedSecret) },
        );

        await this.appUsersRepository.deleteRefreshToken(storedToken.id);

        const newRefreshToken = this.jwtService.sign(
            { appId, sub: user.id },
            {
                secret: this.encryptionService.decrypt(app.encryptedSecret),
                expiresIn: this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
            },
        );
        const refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        await this.appUsersRepository.createRefreshToken(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + ms(this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'))),
        );

        return { accessToken, refreshToken };
    }

    async addRecovery(appId: number, userId: number, recoveryQuestion: string, recoveryAnswer: string): Promise<void> {
        const [app, user] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByIdInApp(appId, userId),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        const answerHash = await bcrypt.hash(recoveryAnswer, 10);
        await this.appUsersRepository.createRecovery(userId, recoveryQuestion, answerHash);
    }

    async listRecovery(appId: number, userId: number): Promise<RecoveryQuestionListDto> {
        const [app, user] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByIdInApp(appId, userId),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }
        const recoveries = await this.appUsersRepository.findRecoveriesByUserId(userId);

        return {
            questions: recoveries.map((recovery) => {
                return { id: recovery.id, question: recovery.question };
            }),
        };
    }

    async askRecoveryQuestions(appId: number, email: string): Promise<RecoveryQuestionListDto> {
        const [app, user] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByEmailInApp(appId, email),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user) {
            throw new NotFoundException('User not found in this application');
        }

        const recoveries = await this.appUsersRepository.findRecoveriesByUserId(user.id);

        return {
            questions: recoveries.map((recovery) => {
                return { id: recovery.id, question: recovery.question };
            }),
        };
    }

    async resetPasswordByRecovery(
        appId: number,
        recoveryId: number,
        email: string,
        recoveryAnswer: string,
        newPassword: string,
    ): Promise<void> {
        const [app, user, recovery] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByEmailInApp(appId, email),
            this.appUsersRepository.findRecoveryById(recoveryId),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user || !recovery) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('This recovery question does not belong to this user');
        }

        await this.verifyCredentialOrThrow(recoveryAnswer, recovery.answerHash);

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await this.appUsersRepository.update(user.id, { passwordHash: newPasswordHash });

        await this.appUsersRepository.deleteAllUserRefreshTokens(user.id);
    }

    async updateRecovery(
        appId: number,
        userId: number,
        recoveryId: number,
        currentPassword: string,
        newRecoveryQuestion: string,
        newRecoveryAnswer: string,
    ): Promise<void> {
        const [app, user, recovery] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByIdInApp(appId, userId),
            this.appUsersRepository.findRecoveryById(recoveryId),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user || !recovery) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('This recovery question does not belong to this user');
        }

        await this.verifyCredentialOrThrow(currentPassword, user.passwordHash);

        const newAnswerHash = await bcrypt.hash(newRecoveryAnswer, 10);

        await this.appUsersRepository.updateRecovery(recoveryId, {
            question: newRecoveryQuestion,
            answerHash: newAnswerHash,
        });
    }

    async removeRecovery(appId: number, userId: number, recoveryId: number, currentPassword: string): Promise<void> {
        const [app, user, recovery] = await Promise.all([
            this.appsRepository.findById(appId),
            this.appUsersRepository.findByIdInApp(appId, userId),
            this.appUsersRepository.findRecoveryById(recoveryId),
        ]);

        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!user || !recovery) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('This recovery question does not belong to this user');
        }

        await this.verifyCredentialOrThrow(currentPassword, user.passwordHash);

        await this.appUsersRepository.deleteRecovery(recoveryId);
    }
}
