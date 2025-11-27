import { Test, TestingModule } from '@nestjs/testing';
import { AppPermissionsController } from './app-permissions.controller';

describe('AppPermissionsController', () => {
    let controller: AppPermissionsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppPermissionsController],
        }).compile();

        controller = module.get<AppPermissionsController>(AppPermissionsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
