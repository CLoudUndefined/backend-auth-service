import { Module } from '@nestjs/common';
import { ServiceUsersModule } from './service-users/service-users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ServiceUsersModule, AuthModule],
})
export class AppModule {}
