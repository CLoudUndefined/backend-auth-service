import { Module } from '@nestjs/common';
import { AppRolesController } from './app-roles.controller';
import { ServiceAppRolesController } from './service-app-roles.controller';
import { AppRolesRepository } from './app-roles.repository';

@Module({
    controllers: [AppRolesController, ServiceAppRolesController],
    providers: [AppRolesRepository],
    exports: [AppRolesRepository],
})
export class AppRolesModule {}
