import { Module } from '@nestjs/common';
import { AppPermissionsController } from './api/app-permissions.controller';
import { ServiceAppPermissionsController } from './api/service-app-permissions.controller';
import { AppPermissionsService } from './service/app-permissions.service';

@Module({
    controllers: [AppPermissionsController, ServiceAppPermissionsController],
    providers: [AppPermissionsService],
})
export class AppPermissionsModule {}
