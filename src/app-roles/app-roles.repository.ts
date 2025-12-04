import { Injectable } from '@nestjs/common';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';

@Injectable()
export class AppRolesRepository {
    async create(appId: number, name: string, description?: string): Promise<ApplicationRoleModel> {
        return ApplicationRoleModel.query().insert({
            appId,
            name,
            description,
        });
    }

    async findById(id: number): Promise<ApplicationRoleModel | undefined> {
        return ApplicationRoleModel.query().findById(id).withGraphFetched('permissions');
    }

    async findAllByApp(appId: number): Promise<ApplicationRoleModel[]> {
        return ApplicationRoleModel.query().where({ appId }).withGraphFetched('permissions');
    }

    async update(
        id: number,
        data: Partial<Pick<ApplicationRoleModel, 'name' | 'description'>>,
    ): Promise<ApplicationRoleModel | undefined> {
        return ApplicationRoleModel.query().patchAndFetchById(id, data);
    }

    async delete(id: number): Promise<number> {
        return ApplicationRoleModel.query().deleteById(id);
    }

    async setPermissions(roleId: number, permissionIds: number[]): Promise<ApplicationRoleModel | undefined> {
        return ApplicationRoleModel.transaction(async (trx) => {
            const role = await ApplicationRoleModel.query(trx).findById(roleId);

            if (!role) {
                return undefined;
            }

            await role.$relatedQuery('permissions', trx).unrelate();

            if (permissionIds.length > 0) {
                await role.$relatedQuery('permissions', trx).relate(permissionIds);
            }

            return ApplicationRoleModel.query(trx).findById(roleId).withGraphFetched('permissions');
        });
    }
}
