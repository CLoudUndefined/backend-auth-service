import { Module } from '@nestjs/common';
import { ServiceUsersController } from './service-users.controller';
import { ServiceUsersService } from './service-users.service';

@Module({
    controllers: [ServiceUsersController],
    providers: [ServiceUsersService],
})
export class ServiceUsersModule {}
