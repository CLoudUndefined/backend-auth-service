import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ServiceUsersModule } from 'src/service-users/service-users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Module({
    imports: [
        ServiceUsersModule,
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
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
