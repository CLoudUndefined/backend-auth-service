import { Inject, Injectable } from '@nestjs/common';
import type { ModelClass } from 'objection';
import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';

@Injectable()
export class AppPermissionsRepository {
    constructor(@Inject(ApplicationPermissionModel) private readonly model: ModelClass<ApplicationPermissionModel>) {}

    async findAll(): Promise<ApplicationPermissionModel[]> {
        return this.model.query();
    }

    async findById(id: number): Promise<ApplicationPermissionModel | undefined> {
        return this.model.query().findById(id);
    }

    async findByIds(ids: number[]): Promise<ApplicationPermissionModel[]> {
        return this.model.query().findByIds(ids);
    }

    async findExistingIds(ids: number[]): Promise<number[]> {
        if (ids.length === 0) {
            return [];
        }

        const existing = await this.model.query().whereIn('id', ids).select('id');
        return existing.map((item) => item.id);
    }
}
