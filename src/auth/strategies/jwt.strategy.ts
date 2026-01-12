import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';

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

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const user = await this.serviceUsersRepository.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return { id: user.id, email: user.email, isGod: user.isGod };
    }
}
