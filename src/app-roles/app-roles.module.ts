import { Module } from '@nestjs/common';
import { AppRolesController } from './api/app-roles.controller';
import { ServiceAppRolesController } from './api/service-app-roles.controller';
import { AppRolesService } from './service/app-roles.service';

@Module({
    controllers: [AppRolesController, ServiceAppRolesController],
    providers: [AppRolesService],
})
export class AppRolesModule {}
