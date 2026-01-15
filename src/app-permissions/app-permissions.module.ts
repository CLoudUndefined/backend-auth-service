import { Module } from '@nestjs/common';
import { AppPermissionsController } from './api/app-permissions.controller';
import { ServiceAppPermissionsController } from './api/service-app-permissions.controller';

@Module({
    controllers: [AppPermissionsController, ServiceAppPermissionsController],
})
export class AppPermissionsModule {}
