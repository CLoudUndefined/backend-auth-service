import { Module } from '@nestjs/common';
import { AppsController } from './api/apps.controller';
import { ServiceAppsController } from './api/service-apps.controller';
import { AppsService } from './service/apps.service';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
    imports: [EncryptionModule],
    controllers: [AppsController, ServiceAppsController],
    providers: [AppsService],
})
export class AppsModule {}
