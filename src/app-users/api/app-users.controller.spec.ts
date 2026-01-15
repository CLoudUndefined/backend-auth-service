import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersController } from './app-users.controller';

describe('AppUsersController', () => {
    let controller: AppUsersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppUsersController],
        }).compile();

        controller = module.get<AppUsersController>(AppUsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
