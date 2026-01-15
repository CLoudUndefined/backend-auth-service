import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationUserRecoveryModel } from 'src/database/models/application-user-recovery.model';
import { ApplicationUserRefreshTokenModel } from 'src/database/models/application-user-refresh-tokens.model';
import { ApplicationUserModel } from 'src/database/models/application-user.model';

@Injectable()
export class AppUsersRepository {
    constructor(
        @Inject(ApplicationUserModel) private readonly userModel: ModelClass<ApplicationUserModel>,
        @Inject(ApplicationUserRecoveryModel) private readonly recoveryModel: ModelClass<ApplicationUserRecoveryModel>,
        @Inject(ApplicationUserRefreshTokenModel)
        private readonly refreshTokenModel: ModelClass<ApplicationUserRefreshTokenModel>,
    ) {}

    async create(appId: number, email: string, passwordHash: string): Promise<ApplicationUserModel> {
        return this.userModel.query().insertAndFetch({
            appId,
            email,
            passwordHash,
            isBanned: false,
        });
    }

    async findById(id: number): Promise<ApplicationUserModel | undefined> {
        return this.userModel.query().findById(id);
    }

    async findByEmailInApp(appId: number, email: string): Promise<ApplicationUserModel | undefined> {
        return this.userModel.query().findOne({ appId, email });
    }

    async findAllByApp(appId: number): Promise<ApplicationUserModel[]> {
        return this.userModel.query().where({ appId });
    }

    async findUsersByRole(appId: number, roleId: number): Promise<ApplicationUserModel[]> {
        return this.userModel
            .query()
            .where({ appId })
            .whereExists(this.userModel.relatedQuery('roles').where('applicationRoles.id', roleId))
            .withGraphFetched('roles.permissions');
    }

    async update(
        id: number,
        data: Partial<Pick<ApplicationUserModel, 'email' | 'passwordHash' | 'isBanned'>>,
    ): Promise<ApplicationUserModel | undefined> {
        const user = await this.userModel.query().patchAndFetchById(id, data);

        if (!user) {
            return undefined;
        }

        return this.userModel.query().findById(user.id);
    }

    async delete(id: number): Promise<number> {
        return this.userModel.query().deleteById(id);
    }

    async addRole(userId: number, roleId: number): Promise<ApplicationUserModel | undefined> {
        const user = await this.userModel.query().findById(userId);

        if (!user) {
            return undefined;
        }

        await user.$relatedQuery('roles').relate(roleId);
        return user.$fetchGraph('roles');
    }

    async removeRole(userId: number, roleId: number): Promise<ApplicationUserModel | undefined> {
        const user = await this.userModel.query().findById(userId);

        if (!user) {
            return undefined;
        }

        await user.$relatedQuery('roles').unrelate().where('id', roleId);
        return user.$fetchGraph('roles');
    }

    async createRefreshToken(
        userId: number,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<ApplicationUserRefreshTokenModel> {
        return this.refreshTokenModel.query().insert({
            userId,
            tokenHash,
            expiresAt,
        });
    }

    async findRefreshTokenByHash(tokenHash: string): Promise<ApplicationUserRefreshTokenModel | undefined> {
        return this.refreshTokenModel.query().findOne({ tokenHash });
    }

    async findRefreshTokensByUserId(userId: number): Promise<ApplicationUserRefreshTokenModel[]> {
        return this.refreshTokenModel.query().where({ userId });
    }

    async deleteRefreshToken(id: number): Promise<number> {
        return this.refreshTokenModel.query().deleteById(id);
    }

    async deleteAllUserRefreshTokens(userId: number): Promise<number> {
        return this.refreshTokenModel.query().where({ userId }).delete();
    }

    async createRecovery(userId: number, question: string, answerHash: string): Promise<ApplicationUserRecoveryModel> {
        return this.recoveryModel.query().insert({
            userId,
            question,
            answerHash,
        });
    }

    async findRecoveriesByUserId(userId: number): Promise<ApplicationUserRecoveryModel[]> {
        return this.recoveryModel.query().where({ userId });
    }

    async updateRecovery(
        id: number,
        data: Partial<Pick<ApplicationUserRecoveryModel, 'question' | 'answerHash'>>,
    ): Promise<ApplicationUserRecoveryModel | undefined> {
        return this.recoveryModel.query().patchAndFetchById(id, data);
    }

    async deleteRecovery(id: number): Promise<number> {
        return this.recoveryModel.query().deleteById(id);
    }

    async exists(appId: number, email: string): Promise<boolean> {
        const result = await this.userModel.query().where({ appId, email }).select(1).first();
        return !!result;
    }
}
