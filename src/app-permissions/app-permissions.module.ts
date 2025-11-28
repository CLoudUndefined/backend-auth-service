import { Module } from '@nestjs/common';
import { AppPermissionsController } from './app-permissions.controller';
import { ServiceAppPermissionsController } from './service-app-permissions.controller';

@Module({
    controllers: [AppPermissionsController, ServiceAppPermissionsController],
})
export class AppPermissionsModule {}
