import { Module } from '@nestjs/common';
import { AppAuthController } from './api/app-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { AppAuthService } from './service/app-auth.service';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { JwtStrategy } from './strategies/jwt.strategy';

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
        EncryptionModule,
    ],
    controllers: [AppAuthController],
    providers: [AppAuthService, JwtStrategy],
})
export class AppAuthModule {}
