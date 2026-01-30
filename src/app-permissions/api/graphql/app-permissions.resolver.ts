import { Args, Query, Resolver } from '@nestjs/graphql';
import { AppPermissionsService } from '../../service/app-permissions.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAppAuthGuard } from 'src/app-auth/guards/gql-jwt-app-auth.guard';
import { AppPermission } from './types/app-permission.type';

@Resolver('AppPermission')
export class AppPermissionsResolver {
    constructor(private readonly appPermissionsService: AppPermissionsService) {}

    @Query('permissions')
    @UseGuards(GqlJwtAppAuthGuard)
    async getPermissions(): Promise<AppPermission[]> {
        const permissions = await this.appPermissionsService.getAllPermissions();
        return permissions.map((permission) => new AppPermission(permission));
    }

    @Query('permission')
    @UseGuards(GqlJwtAppAuthGuard)
    async getPermission(@Args('id') id: number): Promise<AppPermission> {
        const permission = await this.appPermissionsService.getPermission(id);
        return new AppPermission(permission);
    }
}
