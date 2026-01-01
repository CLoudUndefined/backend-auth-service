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

@Injectable()
export class AuthService {
    constructor(
        private readonly serviceUsersService: ServiceUsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterRequestDto): Promise<ServiceUserModel> {
        return await this.serviceUsersService.create(registerDto.email, registerDto.password);
    }

    async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        const user = await this.serviceUsersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isBanned) {
            throw new ForbiddenException('User is banned');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                isGod: user.isGod,
            },
            { expiresIn: '15m' },
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');

        await this.serviceUsersService.saveRefreshToken(
            user.id,
            refreshToken,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        );

        return { accessToken, refreshToken };
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordRequestDto): Promise<void> {
        const user = await this.serviceUsersService.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (changePasswordDto.newPassword == changePasswordDto.oldPassword) {
            throw new BadRequestException('New password must be different');
        }

        const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);

        if (!isOldPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.serviceUsersService.updatePassword(user.id, newPasswordHash);

        await this.serviceUsersService.deleteAllRefreshTokens(userId);
    }
}
