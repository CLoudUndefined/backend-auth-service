import { Module } from '@nestjs/common';
import { AppRolesController } from './app-roles.controller';
import { ServiceAppRolesController } from './service-app-roles.controller';

@Module({
    controllers: [AppRolesController, ServiceAppRolesController],
})
export class AppRolesModule {}
