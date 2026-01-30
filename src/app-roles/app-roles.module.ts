import { Module } from '@nestjs/common';
import { AppRolesController } from './api/rest/app-roles.controller';
import { ServiceAppRolesController } from './api/rest/service-app-roles.controller';
import { AppRolesService } from './service/app-roles.service';
import { AppRolesResolver } from './api/graphql/app-roles.resolver';
import { AppRoleDataLoader } from './api/graphql/dataloaders/app-role.dataloader';

@Module({
    controllers: [AppRolesController, ServiceAppRolesController],
    providers: [AppRolesService, AppRolesResolver, AppRoleDataLoader],
})
export class AppRolesModule {}
