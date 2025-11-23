import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesController } from './app-roles.controller';

describe('AppRolesController', () => {
  let controller: AppRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppRolesController],
    }).compile();

    controller = module.get<AppRolesController>(AppRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
