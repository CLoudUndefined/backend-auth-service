import { Module } from '@nestjs/common';
import { AppRolesController } from './api/app-roles.controller';
import { ServiceAppRolesController } from './api/service-app-roles.controller';

@Module({
    controllers: [AppRolesController, ServiceAppRolesController],
})
export class AppRolesModule {}
