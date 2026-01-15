import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppUsersController } from './service-app-users.controller';

describe('ServiceAppUsersController', () => {
    let controller: ServiceAppUsersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppUsersController],
        }).compile();

        controller = module.get<ServiceAppUsersController>(ServiceAppUsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
