import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { ServiceAppsController } from './service-apps.controller';
import { AppsRepository } from './apps.repository';

@Module({
    controllers: [AppsController, ServiceAppsController],
    providers: [AppsRepository],
    exports: [AppsRepository],
})
export class AppsModule {}
