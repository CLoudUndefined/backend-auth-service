import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtSecretRequestType, JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { AuthenticatedAppUser } from '../interfaces/authenticated-app-user.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-app') {
    constructor(
        private readonly JwtService: JwtService,
        private readonly appsRepository: AppsRepository,
        private readonly encryptionService: EncryptionService,
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
                    const decoded: JwtPayload = this.JwtService.decode(rawJwtToken);

                    if (!decoded || !decoded.appId) {
                        throw new UnauthorizedException('Invalid token');
                    }

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

    validate(payload: JwtPayload): AuthenticatedAppUser {
        return { appId: payload.appId, id: payload.sub };
    }
}
