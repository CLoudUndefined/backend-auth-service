import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt-service' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.getOrThrow<StringValue>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
