import { Module } from '@nestjs/common';
import { ServiceUsersModule } from './service-users/service-users.module';

@Module({
  imports: [ServiceUsersModule],
})
export class AppModule {}
