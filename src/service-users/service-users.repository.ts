import { Injectable } from '@nestjs/common';
import { ServiceUserRecoveryModel } from 'src/database/models/service-user-recovery.model';
import { ServiceUserRefreshTokenModel } from 'src/database/models/service-user-refresh-token.model';
import { ServiceUserModel } from 'src/database/models/service-user.model';

@Injectable()
export class ServiceUsersRepository {
    async create(email: string, passwordHash: string, isGod?: boolean): Promise<ServiceUserModel> {
        return ServiceUserModel.query().insert({
            email,
            passwordHash,
            isGod: isGod ?? false,
            isBanned: false,
        });
    }

    async findById(id: number): Promise<ServiceUserModel | undefined> {
        return ServiceUserModel.query().findById(id);
    }

    async findByEmail(email: string): Promise<ServiceUserModel | undefined> {
        return ServiceUserModel.query().findOne({ email });
    }

    async findAll(): Promise<ServiceUserModel[]> {
        return ServiceUserModel.query();
    }

    async update(
        id: number,
        data: Partial<Pick<ServiceUserModel, 'email' | 'passwordHash' | 'isGod' | 'isBanned'>>,
    ): Promise<ServiceUserModel | undefined> {
        return ServiceUserModel.query().patchAndFetchById(id, data);
    }

    async delete(id: number): Promise<number> {
        return ServiceUserModel.query().deleteById(id);
    }

    async createRefreshToken(
        userId: number,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<ServiceUserRefreshTokenModel> {
        return ServiceUserRefreshTokenModel.query().insert({
            userId,
            tokenHash,
            expiresAt,
        });
    }

    async findRefreshTokenByHash(tokenHash: string): Promise<ServiceUserRefreshTokenModel | undefined> {
        return ServiceUserRefreshTokenModel.query().findOne({ tokenHash });
    }

    async findRefreshTokensByUserId(userId: number): Promise<ServiceUserRefreshTokenModel[]> {
        return ServiceUserRefreshTokenModel.query().where('userId', userId);
    }

    async deleteRefreshToken(id: number): Promise<number> {
        return ServiceUserRefreshTokenModel.query().deleteById(id);
    }

    async deleteAllUserRefreshTokens(userId: number): Promise<number> {
        return ServiceUserRefreshTokenModel.query().where('userId', userId).delete();
    }

    async createRecovery(userId: number, question: string, answerHash: string): Promise<ServiceUserRecoveryModel> {
        return ServiceUserRecoveryModel.query().insert({
            userId,
            question,
            answerHash,
        });
    }

    async findRecoveriesByUserId(userId: number): Promise<ServiceUserRecoveryModel[]> {
        return ServiceUserRecoveryModel.query().where('userId', userId);
    }

    async updateRecovery(
        id: number,
        data: Partial<Pick<ServiceUserRecoveryModel, 'question' | 'answerHash'>>,
    ): Promise<ServiceUserRecoveryModel | undefined> {
        return ServiceUserRecoveryModel.query().patchAndFetchById(id, data);
    }

    async deleteRecovery(id: number): Promise<number> {
        return ServiceUserRecoveryModel.query().deleteById(id);
    }

    async exists(email: string): Promise<boolean> {
        const result = await this.findByEmail(email);
        return !!result;
    }
}
