import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { ServiceAppsController } from './service-apps.controller';
import { AppsService } from './apps.service';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
    imports: [EncryptionModule],
    controllers: [AppsController, ServiceAppsController],
    providers: [AppsService],
})
export class AppsModule {}
