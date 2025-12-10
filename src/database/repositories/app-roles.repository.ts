import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';

@Injectable()
export class AppRolesRepository {
    constructor(@Inject(ApplicationRoleModel) private model: ModelClass<ApplicationRoleModel>) {}

    async create(appId: number, name: string, description?: string): Promise<ApplicationRoleModel> {
        return this.model.query().insert({
            appId,
            name,
            description,
        });
    }

    async findById(id: number): Promise<ApplicationRoleModel | undefined> {
        return this.model.query().findById(id);
    }

    async findAllByApp(appId: number): Promise<ApplicationRoleModel[]> {
        return this.model.query().where({ appId });
    }

    async update(
        id: number,
        data: Partial<Pick<ApplicationRoleModel, 'name' | 'description'>>,
    ): Promise<ApplicationRoleModel | undefined> {
        return this.model.query().patchAndFetchById(id, data);
    }

    async delete(id: number): Promise<number> {
        return this.model.query().deleteById(id);
    }

    async setPermissions(roleId: number, permissionIds: number[]): Promise<ApplicationRoleModel | undefined> {
        return ApplicationRoleModel.transaction(async (trx) => {
            const role = await this.model.query(trx).findById(roleId);

            if (!role) {
                return undefined;
            }

            await role.$relatedQuery('permissions', trx).unrelate();

            if (permissionIds.length > 0) {
                await role.$relatedQuery('permissions', trx).relate(permissionIds);
            }

            return this.model.query(trx).findById(roleId).withGraphFetched('permissions');
        });
    }
}
