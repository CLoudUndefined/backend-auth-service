import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlAppPermissionGuard } from 'src/app-auth/guards/gql-app-permissions.guard';
import { GqlJwtAppAuthGuard } from 'src/app-auth/guards/gql-jwt-app-auth.guard';
import { type AuthenticatedAppUser } from 'src/app-auth/interfaces/authenticated-app-user.interface';
import { AppRolesService } from 'src/app-roles/service/app-roles.service';
import { AppRole } from './types/app-role.type';
import { Permissions } from 'src/app-auth/decorators/permissions.reflector';
import { AppPermission } from 'src/app-auth/enums/app-permissions.enum';
import { UseGuards } from '@nestjs/common';
import { AppRoleDataLoader } from './dataloaders/app-role.dataloader';
import { GqlAppUser } from 'src/common/decorators/gql-app-user.decorator';
import { AppPermission as AppPermissionType } from 'src/app-permissions/api/graphql/types/app-permission.type';

@Resolver('AppRole')
export class AppRolesResolver {
    constructor(
        private readonly appRolesService: AppRolesService,
        private readonly appRoleDataLoader: AppRoleDataLoader,
    ) {}

    @Query('roles')
    @UseGuards(GqlJwtAppAuthGuard, GqlAppPermissionGuard)
    @Permissions(AppPermission.ROLES_READ, AppPermission.ROLES_MANAGE)
    async getAppRoles(@GqlAppUser() user: AuthenticatedAppUser): Promise<AppRole[]> {
        const roles = await this.appRolesService.getAllRoles(user.appId);
        return roles.map((role) => new AppRole(role)) || [];
    }

    @ResolveField('permissions')
    async permissions(@Parent() role: AppRole) {
        const permissions = await this.appRoleDataLoader.batchPermissions.load(role.id);
        return permissions.map((permission) => new AppPermissionType(permission));
    }
}
