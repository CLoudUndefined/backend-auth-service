import { Module } from '@nestjs/common';
import { AppUsersController } from './app-users.controller';
import { ServiceAppUsersController } from './service-app-users.controller';
import { AppUsersRepository } from './app-users.repository';

@Module({
    controllers: [AppUsersController, ServiceAppUsersController],
    providers: [AppUsersRepository],
    exports: [AppUsersRepository],
})
export class AppUsersModule {}
