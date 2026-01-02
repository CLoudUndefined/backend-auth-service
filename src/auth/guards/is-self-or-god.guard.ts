import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IsSelfOrGodGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const targetUserId = parseInt(request.params.id, 10);

        if (!user?.isGod && user.id !== targetUserId) {
            throw new ForbiddenException('Can only access own resources or requires god privileges');
        }

        return true;
    }
}
