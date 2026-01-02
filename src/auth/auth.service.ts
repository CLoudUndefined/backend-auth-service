import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto } from 'src/common/dto/auth/login-request.dto';
import { LoginResponseDto } from 'src/common/dto/auth/login-response.dto';
import { RegisterRequestDto } from 'src/common/dto/auth/register-request.dto';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import { ServiceUsersService } from 'src/service-users/service-users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordRequestDto } from 'src/common/dto/auth/change-password-request.dto';
import { AddRecoveryRequestDto } from 'src/common/dto/auth/add-recovery-request.dto';
import { ListRecoveryResponseDto } from 'src/common/dto/auth/list-recovery-response.dto';
import { RecoveryAskResponseDto } from 'src/common/dto/auth/recovery-ask-response.dto';
import { RecoveryResetRequestDto } from 'src/common/dto/auth/recovery-reset-request.dto';
import { UpdateRecoveryRequestDto } from 'src/common/dto/auth/update-recovery-request.dto';
import { RemoveRecoveryRequestDto } from 'src/common/dto/auth/remove-recovery-request.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly serviceUsersService: ServiceUsersService,
        private readonly jwtService: JwtService,
    ) {}

    private async verifyCredentialOrThrow(stringPlain: string, stringHash: string): Promise<void> {
        const isValid = await bcrypt.compare(stringPlain, stringHash);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async register(registerDto: RegisterRequestDto): Promise<ServiceUserModel> {
        return this.serviceUsersService.create(registerDto.email, registerDto.password);
    }

    async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        const user = await this.serviceUsersService.findByEmailOrThrow(loginDto.email, 'Invalid credentials');

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        await this.verifyCredentialOrThrow(loginDto.password, user.passwordHash);

        const accessToken = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                isGod: user.isGod,
            },
            { expiresIn: '15m' },
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        await this.serviceUsersService.createRefreshToken(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        );

        return { accessToken, refreshToken };
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordRequestDto): Promise<void> {
        const user = await this.serviceUsersService.findByIdOrThrow(userId, 'Invalid credentials');

        if (changePasswordDto.newPassword === changePasswordDto.oldPassword) {
            throw new BadRequestException('New password must be different');
        }

        await this.verifyCredentialOrThrow(changePasswordDto.oldPassword, user.passwordHash);

        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.serviceUsersService.updatePassword(user.id, newPasswordHash);

        await this.serviceUsersService.deleteAllRefreshTokens(userId);
    }

    async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const storedToken = await this.serviceUsersService.findRefreshTokenByHash(tokenHash);

        if (!storedToken) {
            throw new NotFoundException('Invalid refresh token');
        }

        if (new Date() > storedToken.expiresAt) {
            await this.serviceUsersService.deleteRefreshTokenById(storedToken.id);
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = await this.serviceUsersService.findByIdOrThrow(storedToken.userId, 'Invalid credentials');

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        const accessToken = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                isGod: user.isGod,
            },
            { expiresIn: '15m' },
        );

        await this.serviceUsersService.deleteRefreshTokenById(storedToken.id);

        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        await this.serviceUsersService.createRefreshToken(
            user.id,
            newRefreshTokenHash,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        );

        return { accessToken, refreshToken: newRefreshToken };
    }

    async addRecovery(userId: number, addRecoveryDto: AddRecoveryRequestDto): Promise<void> {
        const answerHash = await bcrypt.hash(addRecoveryDto.recoveryAnswer, 10);

        await this.serviceUsersService.createRecovery(userId, addRecoveryDto.recoveryQuestion, answerHash);
    }

    async listRecovery(userId: number): Promise<ListRecoveryResponseDto> {
        const recoveries = await this.serviceUsersService.findRecoveriesByUserId(userId);

        return {
            questions: recoveries.map((recovery) => {
                return { id: recovery.id, question: recovery.question };
            }),
        };
    }

    async askRecoveryQuestions(email: string): Promise<RecoveryAskResponseDto> {
        const user = await this.serviceUsersService.findByEmail(email);

        if (!user) {
            return { questions: [] };
        }

        const recoveries = await this.serviceUsersService.findRecoveriesByUserId(user.id);

        return {
            questions: recoveries.map((recovery) => {
                return { id: recovery.id, question: recovery.question };
            }),
        };
    }

    async resetPasswordByRecovery(recoveryResetDto: RecoveryResetRequestDto): Promise<void> {
        const user = await this.serviceUsersService.findByEmailOrThrow(recoveryResetDto.email, 'Invalid credentials');

        const recovery = await this.serviceUsersService.findRecoveryByIdOrThrow(
            recoveryResetDto.recoveryId,
            'Invalid credentials',
        );

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('This recovery question does not belong to this user');
        }

        await this.verifyCredentialOrThrow(recoveryResetDto.answer, recovery.answerHash);

        const newPasswordHash = await bcrypt.hash(recoveryResetDto.newPassword, 10);

        await this.serviceUsersService.updatePassword(user.id, newPasswordHash);

        await this.serviceUsersService.deleteAllRefreshTokens(user.id);
    }

    async updateRecovery(
        userId: number,
        recoveryId: number,
        updateRecoveryDto: UpdateRecoveryRequestDto,
    ): Promise<void> {
        const user = await this.serviceUsersService.findByIdOrThrow(userId, 'Invalid credentials');

        const recovery = await this.serviceUsersService.findRecoveryByIdOrThrow(recoveryId, 'Invalid credentials');

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('Recovery question not found');
        }

        await this.verifyCredentialOrThrow(updateRecoveryDto.currentPassword, user.passwordHash);

        const newAnswerHash = await bcrypt.hash(updateRecoveryDto.newAnswer, 10);

        await this.serviceUsersService.updateRecovery(recoveryId, updateRecoveryDto.newQuestion, newAnswerHash);
    }

    async removeRecovery(
        userId: number,
        recoveryId: number,
        removeRecoveryDto: RemoveRecoveryRequestDto,
    ): Promise<void> {
        const user = await this.serviceUsersService.findByIdOrThrow(userId, 'Invalid credentials');

        const recovery = await this.serviceUsersService.findRecoveryByIdOrThrow(recoveryId, 'Invalid credentials');

        if (recovery.userId !== user.id) {
            throw new ForbiddenException('Recovery question not found');
        }

        await this.verifyCredentialOrThrow(removeRecoveryDto.currentPassword, user.passwordHash);

        await this.serviceUsersService.deleteRecovery(recoveryId);
    }
}
