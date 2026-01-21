import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersService } from './app-users.service';

describe('AppUsersService', () => {
  let service: AppUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppUsersService],
    }).compile();

    service = module.get<AppUsersService>(AppUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
