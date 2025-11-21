import { Module } from '@nestjs/common';
import { ServiceUsersController } from './service-users.controller';

@Module({
  controllers: [ServiceUsersController],
})
export class ServiceUsersModule {}
