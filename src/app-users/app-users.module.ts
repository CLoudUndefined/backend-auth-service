import { Module } from '@nestjs/common';
import { AppUsersController } from './app-users.controller';
import { ServiceAppUsersController } from './service-app-users.controller';
import { AppUsersService } from './app-users.service';

@Module({
    controllers: [AppUsersController, ServiceAppUsersController],
    providers: [AppUsersService],
})
export class AppUsersModule {}
