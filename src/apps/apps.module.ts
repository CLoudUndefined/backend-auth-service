import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { ServiceAppsController } from './service-apps.controller';

@Module({
    controllers: [AppsController, ServiceAppsController],
})
export class AppsModule {}
