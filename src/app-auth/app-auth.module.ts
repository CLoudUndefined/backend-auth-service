import { Module } from '@nestjs/common';
import { AppAuthController } from './app-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { AppAuthService } from './app-auth.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt-app' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                signOptions: {
                    expiresIn: configService.getOrThrow<StringValue>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
                },
            }),
        }),
    ],
    controllers: [AppAuthController],
    providers: [AppAuthService],
})
export class AppAuthModule {}
