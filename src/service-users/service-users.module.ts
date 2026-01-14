import { Module } from '@nestjs/common';
import { ServiceUsersController } from './api/service-users.controller';
import { ServiceUsersService } from './service/service-users.service';

@Module({
    controllers: [ServiceUsersController],
    providers: [ServiceUsersService],
    exports: [ServiceUsersService],
})
export class ServiceUsersModule {}
