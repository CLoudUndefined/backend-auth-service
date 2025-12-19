import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ServiceUsersService } from 'src/service-users/service-users.service';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-service') {
    constructor(
        private readonly configService: ConfigService,
        private readonly serviceUsersService: ServiceUsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const user = await this.serviceUsersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('user not found');
        }

        return { id: user.id, email: user.email, isGod: user.isGod };
    }
}
