import { Args, Query, Resolver } from '@nestjs/graphql';
import { AppPermissionsService } from '../../service/app-permissions.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAppAuthGuard } from 'src/app-auth/guards/gql-jwt-app-auth.guard';

@Resolver('AppPermission')
export class AppPermissionsResolver {
    constructor(private readonly appPermissionsService: AppPermissionsService) {}

    @Query('permissions')
    @UseGuards(GqlJwtAppAuthGuard)
    async getPermissions() {
        const permissions = await this.appPermissionsService.getAllPermissions();
        return permissions.map((permission) => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            createdAt: permission.createdAt.toISOString(),
        }));
    }

    @Query('permission')
    @UseGuards(GqlJwtAppAuthGuard)
    async getPermission(@Args('id') id: number) {
        const permission = await this.appPermissionsService.getPermission(id);
        return {
            id: permission.id,
            name: permission.name,
            description: permission.description,
            createdAt: permission.createdAt.toISOString(),
        };
    }
}
