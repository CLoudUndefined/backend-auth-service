import { ConflictException, Injectable } from '@nestjs/common';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import * as bcrypt from 'bcrypt';
import { ApplicationUserModel } from 'src/database/models/application-user.model';

@Injectable()
export class AppAuthService {
    constructor(private readonly appUsersRepository: AppUsersRepository) {}

    async register(
        appId: number,
        email: string,
        plainPassword: string,
        recoveryQuestion?: string,
        recoveryAnswer?: string,
    ): Promise<ApplicationUserModel> {
        const existingUser = await this.appUsersRepository.exists(appId, email);

        if (existingUser) {
            throw new ConflictException('User with this email alreadt exists');
        }

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const user = await this.appUsersRepository.create(appId, email, passwordHash);

        if (recoveryQuestion && recoveryAnswer) {
            const answerHash = await bcrypt.hash(recoveryAnswer, 10);
            await this.appUsersRepository.createRecovery(user.id, recoveryQuestion, answerHash);
        }

        return user;
    }
}
