import { Module } from '@nestjs/common';
import { ServiceUsersModule } from './service-users/service-users.module';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';

@Module({
  imports: [ServiceUsersModule, AuthModule, AppsModule]
})
export class AppModule {}
