import { Module } from '@nestjs/common';
import { AppPermissionsController } from './app-permissions.controller';
import { ServiceAppPermissionsController } from './service-app-permissions.controller';
import { AppPermissionsRepository } from './app-permissions.repository';

@Module({
    controllers: [AppPermissionsController, ServiceAppPermissionsController],
    providers: [AppPermissionsRepository],
    exports: [AppPermissionsRepository],
})
export class AppPermissionsModule {}
