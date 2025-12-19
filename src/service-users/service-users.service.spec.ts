import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUsersService } from './service-users.service';

describe('ServiceUsersService', () => {
  let service: ServiceUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceUsersService],
    }).compile();

    service = module.get<ServiceUsersService>(ServiceUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
