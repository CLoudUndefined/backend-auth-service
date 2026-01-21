import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedAppUser } from '../interfaces/authenticated-app-user.interface';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';

@Injectable()
export class AppPermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly appUsersRepository: AppUsersRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedAppUser;

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const appUser = await this.appUsersRepository.findByIdInAppWithRolesAndPermissions(user.appId, user.id);

        if (!appUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const appUserPermissions =
            appUser.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name) || []) || [];
        const hasPermission = requiredPermissions.every((permission) => appUserPermissions.includes(permission));

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
