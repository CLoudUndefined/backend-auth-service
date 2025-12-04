import { Module } from '@nestjs/common';
import { ServiceUsersController } from './service-users.controller';
import { ServiceUsersRepository } from './service-users.repository';

@Module({
    controllers: [ServiceUsersController],
    providers: [ServiceUsersRepository],
    exports: [ServiceUsersRepository],
})
export class ServiceUsersModule {}
