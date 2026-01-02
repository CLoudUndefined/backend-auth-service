import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ServiceUserRecoveryModel } from 'src/database/models/service-user-recovery.model';
import { ServiceUserRefreshTokenModel } from 'src/database/models/service-user-refresh-token.model';
import { ServiceUserModel } from 'src/database/models/service-user.model';

@Injectable()
export class ServiceUsersRepository {
    constructor(
        @Inject(ServiceUserModel) private readonly userModel: ModelClass<ServiceUserModel>,
        @Inject(ServiceUserRecoveryModel) readonly recoveryModel: ModelClass<ServiceUserRecoveryModel>,
        @Inject(ServiceUserRefreshTokenModel)
        private readonly refreshTokenModel: ModelClass<ServiceUserRefreshTokenModel>,
    ) {}

    async create(email: string, passwordHash: string, isGod?: boolean): Promise<ServiceUserModel> {
        return this.userModel.query().insertAndFetch({
            email,
            passwordHash,
            isGod: isGod ?? false,
            isBanned: false,
        });
    }

    async findById(id: number): Promise<ServiceUserModel | undefined> {
        return this.userModel.query().findById(id);
    }

    async findByEmail(email: string): Promise<ServiceUserModel | undefined> {
        return this.userModel.query().findOne({ email });
    }

    async findAll(): Promise<ServiceUserModel[]> {
        return this.userModel.query();
    }

    async update(
        id: number,
        data: Partial<Pick<ServiceUserModel, 'email' | 'passwordHash' | 'isGod' | 'isBanned'>>,
    ): Promise<ServiceUserModel | undefined> {
        return this.userModel.query().patchAndFetchById(id, data);
    }

    async delete(id: number): Promise<number> {
        return this.userModel.query().deleteById(id);
    }

    async createRefreshToken(
        userId: number,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<ServiceUserRefreshTokenModel> {
        return this.refreshTokenModel.query().insert({
            userId,
            tokenHash,
            expiresAt,
        });
    }

    async findRefreshTokenByHash(tokenHash: string): Promise<ServiceUserRefreshTokenModel | undefined> {
        return this.refreshTokenModel.query().findOne({ tokenHash });
    }

    async findRefreshTokensByUserId(userId: number): Promise<ServiceUserRefreshTokenModel[]> {
        return this.refreshTokenModel.query().where({ userId });
    }

    async deleteRefreshToken(id: number): Promise<number> {
        return this.refreshTokenModel.query().deleteById(id);
    }

    async deleteAllUserRefreshTokens(userId: number): Promise<number> {
        return this.refreshTokenModel.query().where({ userId }).delete();
    }

    async createRecovery(userId: number, question: string, answerHash: string): Promise<ServiceUserRecoveryModel> {
        return this.recoveryModel.query().insert({
            userId,
            question,
            answerHash,
        });
    }

    async findRecoveriesByUserId(userId: number): Promise<ServiceUserRecoveryModel[]> {
        return this.recoveryModel.query().where({ userId });
    }

    async findRecoveryById(id: number): Promise<ServiceUserRecoveryModel | undefined> {
        return this.recoveryModel.query().findById(id);
    }

    async updateRecovery(
        id: number,
        data: Partial<Pick<ServiceUserRecoveryModel, 'question' | 'answerHash'>>,
    ): Promise<ServiceUserRecoveryModel | undefined> {
        return this.recoveryModel.query().patchAndFetchById(id, data);
    }

    async deleteRecovery(id: number): Promise<number> {
        return this.recoveryModel.query().deleteById(id);
    }

    async existsByEmail(email: string): Promise<boolean> {
        const result = await this.userModel.query().where({ email }).select(1).first();
        return !!result;
    }
}
