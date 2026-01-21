import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { AuthenticatedServiceUser } from '../interfaces/authenticated-service-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-service') {
    constructor(
        private readonly configService: ConfigService,
        private readonly serviceUsersRepository: ServiceUsersRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    validate(payload: JwtPayload): AuthenticatedServiceUser {
        return { id: payload.sub };
    }
}
