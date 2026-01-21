import { Module } from '@nestjs/common';
import { AppUsersController } from './api/app-users.controller';
import { ServiceAppUsersController } from './api/service-app-users.controller';
import { AppUsersService } from './service/app-users.service';

@Module({
    controllers: [AppUsersController, ServiceAppUsersController],
    providers: [AppUsersService],
})
export class AppUsersModule {}
