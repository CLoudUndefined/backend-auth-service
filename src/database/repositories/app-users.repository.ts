import { Injectable } from '@nestjs/common';
import { ApplicationUserModel } from 'src/database/models/application-user.model';

@Injectable()
export class AppUsersRepository {
    async create(appId: number, email: string, passwordHash: string): Promise<ApplicationUserModel> {
        return ApplicationUserModel.query().insert({
            appId,
            email,
            passwordHash,
            isBanned: false,
        });
    }

    async findById(id: number): Promise<ApplicationUserModel | undefined> {
        return ApplicationUserModel.query().findById(id).withGraphFetched('roles.permissions');
    }

    async findByEmailInApp(appId: number, email: string): Promise<ApplicationUserModel | undefined> {
        return ApplicationUserModel.query().findOne({ appId, email }).withGraphFetched('roles.permissions');
    }

    async findAllByApp(appId: number): Promise<ApplicationUserModel[]> {
        return ApplicationUserModel.query().where({ appId }).withGraphFetched('roles.permissions');
    }

    async findUsersByRole(appId: number, roleId: number): Promise<ApplicationUserModel[]> {
        return ApplicationUserModel.query()
            .where({ appId })
            .whereExists(ApplicationUserModel.relatedQuery('roles').where('application_roles.id', roleId))
            .withGraphFetched('roles.permissions');
    }

    async update(
        id: number,
        data: Partial<Pick<ApplicationUserModel, 'email' | 'passwordHash' | 'isBanned'>>,
    ): Promise<ApplicationUserModel | undefined> {
        const user = await ApplicationUserModel.query().patchAndFetchById(id, data);

        if (!user) {
            return undefined;
        }

        return ApplicationUserModel.query().findById(user.id).withGraphFetched('roles.permissions');
    }

    async delete(id: number): Promise<number> {
        return ApplicationUserModel.query().deleteById(id);
    }

    async addRole(userId: number, roleId: number): Promise<ApplicationUserModel | undefined> {
        return ApplicationUserModel.transaction(async (trx) => {
            const user = await ApplicationUserModel.query(trx).findById(userId);

            if (!user) {
                return undefined;
            }

            await user.$relatedQuery('roles', trx).relate(roleId);
            return user.$fetchGraph('roles', { transaction: trx });
        });
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
