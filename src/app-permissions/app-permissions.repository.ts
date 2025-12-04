import { Injectable } from '@nestjs/common';
import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';

@Injectable()
export class AppPermissionsRepository {
    async findAll(): Promise<ApplicationPermissionModel[]> {
        return ApplicationPermissionModel.query();
    }

    async findById(id: number): Promise<ApplicationPermissionModel | undefined> {
        return ApplicationPermissionModel.query().findById(id);
    }

    async findByIds(ids: number[]): Promise<ApplicationPermissionModel[]> {
        return ApplicationPermissionModel.query().findByIds(ids);
    }
}
