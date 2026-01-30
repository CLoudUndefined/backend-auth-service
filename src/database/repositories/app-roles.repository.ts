import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationRoleModel } from 'src/database/models/application-role.model';
import { ApplicationRoleWithPermissionsModel } from 'src/types/application-role.types';
import { ApplicationUserRoleModel } from '../models/application-user-role.model';

@Injectable()
export class AppRolesRepository {
    constructor(
        @Inject(ApplicationRoleModel) private readonly model: ModelClass<ApplicationRoleModel>,
        @Inject(ApplicationUserRoleModel) private readonly userRoleModel: ModelClass<ApplicationUserRoleModel>,
    ) {}

    async createWithPermissions(
        appId: number,
        name: string,
        description?: string,
        permissionIds: number[] = [],
    ): Promise<ApplicationRoleWithPermissionsModel> {
        return this.model
            .query()
            .insertGraphAndFetch(
                {
                    appId,
                    name,
                    description,
                    permissions: permissionIds.map((id) => ({ id })),
                },
                { relate: true },
            )
            .castTo<ApplicationRoleWithPermissionsModel>();
    }

    async findById(id: number): Promise<ApplicationRoleModel | undefined> {
        return this.model.query().findById(id);
    }

    async findAllByApp(appId: number): Promise<ApplicationRoleModel[]> {
        return this.model.query().where({ appId });
    }

    async findByIdInApp(appId: number, roleId: number): Promise<ApplicationRoleModel | undefined> {
        return this.model.query().findOne({ appId, id: roleId });
    }

    async findByIdWithPermissionsInApp(
        appId: number,
        roleId: number,
    ): Promise<ApplicationRoleWithPermissionsModel | undefined> {
        return this.model
            .query()
            .findOne({ appId, id: roleId })
            .withGraphFetched('permissions')
            .castTo<ApplicationRoleWithPermissionsModel>();
    }

    async findByIdsWithPermissions(roleIds: number[]): Promise<ApplicationRoleWithPermissionsModel[]> {
        if (roleIds.length === 0) {
            return [];
        }

        return this.model
            .query()
            .findByIds(roleIds)
            .withGraphFetched('permissions')
            .castTo<ApplicationRoleWithPermissionsModel[]>();
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

    async setPermissions(roleId: number, permissionIds: number[]): Promise<void> {
        return ApplicationRoleModel.transaction(async (trx) => {
            const role = await this.model.query(trx).findById(roleId);

            if (!role) {
                return;
            }

            await role.$relatedQuery('permissions', trx).unrelate();

            if (permissionIds.length > 0) {
                await role.$relatedQuery('permissions', trx).relate(permissionIds);
            }
        });
    }

    async existsByNameInApp(appId: number, name: string): Promise<boolean> {
        const result = await this.model.query().where({ appId, name }).select(1).first();
        return !!result;
    }

    async existsByIdInApp(appId: number, roleId: number): Promise<boolean> {
        const result = await this.model.query().where({ appId, id: roleId }).select(1).first();
        return !!result;
    }

    async hasUsers(roleId: number): Promise<boolean> {
        const result = await this.userRoleModel.query().where('roleId', roleId).select(1).first();
        return !!result;
    }
}
