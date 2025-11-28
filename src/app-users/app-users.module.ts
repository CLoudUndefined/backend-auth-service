import { Module } from '@nestjs/common';
import { AppUsersController } from './app-users.controller';
import { ServiceAppUsersController } from './service-app-users.controller';

@Module({
    controllers: [AppUsersController, ServiceAppUsersController],
})
export class AppUsersModule {}
