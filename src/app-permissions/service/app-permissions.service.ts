import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationPermissionModel } from 'src/database/models/application-permission.model';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';

@Injectable()
export class AppPermissionsService {
    constructor(private readonly appPermissionsRepository: AppPermissionsRepository) {}

    async getAllPermissions(): Promise<ApplicationPermissionModel[]> {
        return this.appPermissionsRepository.findAll();
    }

    async getPermission(permissionId: number): Promise<ApplicationPermissionModel> {
        const permission = await this.appPermissionsRepository.findById(permissionId);

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        return permission;
    }
}
