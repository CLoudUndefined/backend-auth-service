import { Module } from '@nestjs/common';
import { AppRolesController } from './app-roles.controller';

@Module({
  controllers: [AppRolesController]
})
export class AppRolesModule {}
