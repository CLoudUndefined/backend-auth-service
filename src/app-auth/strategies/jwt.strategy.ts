import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtSecretRequestType, JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { EncryptionService } from 'src/encryption/encryption.service';
import { AuthenticatedAppUser } from '../interfaces/authenticated-app-user.interface';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { ValidationError } from 'objection';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-app') {
    constructor(
        private readonly jwtService: JwtService,
        private readonly encryptionService: EncryptionService,
        private readonly appsRepository: AppsRepository,
        private readonly appUsersRepository: AppUsersRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: async (
                request: JwtSecretRequestType,
                rawJwtToken: string,
                done: (err: Error | null, secretOrKey?: string | Buffer) => void,
            ): Promise<void> => {
                try {
                    const decoded = this.jwtService.decode(rawJwtToken) as AuthenticatedAppUser;

                    const app = await this.appsRepository.findById(decoded.appId);
                    if (!app) {
                        throw new UnauthorizedException('Application not found');
                    }

                    done(null, this.encryptionService.decrypt(app.encryptedSecret));
                } catch (err) {
                    done(err, undefined);
                }
            },
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedAppUser> {
        const user = await this.appUsersRepository.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return { appId: user.appId, id: user.id, email: user.email };
    }
}
