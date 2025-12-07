import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationUserRecoveryModel } from 'src/database/models/application-user-recovery.model';
import { ApplicationUserRefreshTokenModel } from 'src/database/models/application-user-refresh-tokens.model';
import { ApplicationUserModel } from 'src/database/models/application-user.model';

@Injectable()
export class AppUsersRepository {
    constructor(
        @Inject(ApplicationUserModel) private userModel: ModelClass<ApplicationUserModel>,
        @Inject(ApplicationUserRecoveryModel) private recoveryModel: ModelClass<ApplicationUserRecoveryModel>,
        @Inject(ApplicationUserRefreshTokenModel)
        private refreshTokenModel: ModelClass<ApplicationUserRefreshTokenModel>,
    ) {}

    async create(appId: number, email: string, passwordHash: string): Promise<ApplicationUserModel> {
        return this.userModel.query().insert({
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
        return ApplicationUserModel.transaction(async (trx) => {
            const user = await ApplicationUserModel.query(trx).findById(userId);

            if (!user) {
                return undefined;
            }

            await user.$relatedQuery('roles').unrelate().where('id', roleId);
            return user.$fetchGraph('roles');
        });
    }
}
