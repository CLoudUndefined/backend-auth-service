import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedAppUser } from '../interfaces/authenticated-app-user.interface';

@Injectable()
export class AppPermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedAppUser;

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const appUserPermissions =
            user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name) || []) || [];
        const hasPermission = requiredPermissions.every((permission) => appUserPermissions.includes(permission));

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
