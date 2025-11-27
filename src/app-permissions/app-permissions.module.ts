import { Module } from '@nestjs/common';
import { AppPermissionsController } from './app-permissions.controller';

@Module({
    controllers: [AppPermissionsController],
})
export class AppPermissionsModule {}
