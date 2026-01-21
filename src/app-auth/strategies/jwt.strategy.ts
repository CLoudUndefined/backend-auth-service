import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtSecretRequestType, JwtService } from '@nestjs/jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { AuthenticatedAppUser } from '../interfaces/authenticated-app-user.interface';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-app') {
    constructor(
        private readonly jwtService: JwtService,
        private readonly encryptionService: EncryptionService,
        private readonly appsRepository: AppsRepository,
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
                    const decoded: JwtPayload = this.jwtService.decode(rawJwtToken);

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
