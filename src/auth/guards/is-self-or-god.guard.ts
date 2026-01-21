import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';

@Injectable()
export class IsSelfOrGodGuard implements CanActivate {
    constructor(private readonly serviceUsersRepository: ServiceUsersRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const targetUserId = parseInt(request.params.id, 10);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.id === targetUserId) {
            return true;
        }

        const serviceUser = await this.serviceUsersRepository.findById(user.id);

        if (!serviceUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!serviceUser.isGod) {
            throw new ForbiddenException('Can only access own resources or requires god privileges');
        }

        return true;
    }
}
