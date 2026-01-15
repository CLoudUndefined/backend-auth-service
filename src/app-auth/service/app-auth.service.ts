import {
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
import { EncryptionService } from 'src/encryption/encryption.service';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

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
        const existingUser = await this.appUsersRepository.exists(appId, email);

        if (existingUser) {
            throw new ConflictException('User with this email alreadt exists');
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
            { appId, sub: user.id, email: user.email },
            { secret: this.encryptionService.decrypt(app.encryptedSecret) },
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        await this.appUsersRepository.createRefreshToken(
            user.id,
            refreshTokenHash,
            new Date(Date.now() + ms(this.configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'))),
        );

        return { accessToken, refreshToken };
    }
}
