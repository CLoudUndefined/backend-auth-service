import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesService } from './app-roles.service';

describe('AppRolesService', () => {
  let service: AppRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppRolesService],
    }).compile();

    service = module.get<AppRolesService>(AppRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
