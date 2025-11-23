import { Module } from '@nestjs/common';
import { AppUsersController } from './app-users.controller';

@Module({
    controllers: [AppUsersController],
})
export class AppUsersModule {}
