import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';

@Injectable()
export class IsGodGuard implements CanActivate {
    constructor(private readonly serviceUsersRepository: ServiceUsersRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const serviceUser = await this.serviceUsersRepository.findById(user.id);

        if (!serviceUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!serviceUser.isGod) {
            throw new ForbiddenException('God privileges required');
        }

        return true;
    }
}
