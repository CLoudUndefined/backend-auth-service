import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUsersController } from './service-users.controller';

describe('ServiceUsersController', () => {
  let controller: ServiceUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceUsersController],
    }).compile();

    controller = module.get<ServiceUsersController>(ServiceUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
