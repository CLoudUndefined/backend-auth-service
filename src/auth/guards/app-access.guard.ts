import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ServiceRequest } from 'src/types/service-request.types';

@Injectable()
export class AppAccessGuard implements CanActivate {
    constructor(
        private readonly appsRepository: AppsRepository,
        private readonly serviceUsersRepository: ServiceUsersRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<ServiceRequest>();
        const user = request.user;
        const appId = parseInt(
            Array.isArray(request.params.appId) ? request.params.appId[0] : request.params.appId,
            10,
        );

        if (Number.isNaN(appId)) {
            throw new NotFoundException('Invalid application id');
        }

        const serviceUser = await this.serviceUsersRepository.findById(user.id);
        if (!serviceUser) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const app = await this.appsRepository.findById(appId);
        if (!app) {
            throw new NotFoundException('Application not found');
        }

        if (!serviceUser.isGod && app.ownerId !== user.id) {
            throw new ForbiddenException('You can only manage users in your own applications');
        }

        return true;
    }
}
