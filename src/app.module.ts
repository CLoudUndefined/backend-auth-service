import { Module } from '@nestjs/common';
import { ServiceUsersModule } from './service-users/service-users.module';
import { AuthModule } from './auth/auth.module';
import { AppsModule } from './apps/apps.module';
import { AppAuthModule } from './app-auth/app-auth.module';

@Module({
  imports: [ServiceUsersModule, AuthModule, AppsModule, AppAuthModule]
})
export class AppModule {}
