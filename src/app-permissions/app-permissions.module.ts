import { Module } from '@nestjs/common';
import { AppPermissionsController } from './api/rest/app-permissions.controller';
import { ServiceAppPermissionsController } from './api/rest/service-app-permissions.controller';
import { AppPermissionsService } from './service/app-permissions.service';
import { AppPermissionsResolver } from './api/graphql/app-permissions.resolver';

@Module({
    controllers: [AppPermissionsController, ServiceAppPermissionsController],
    providers: [AppPermissionsService, AppPermissionsResolver],
})
export class AppPermissionsModule {}
