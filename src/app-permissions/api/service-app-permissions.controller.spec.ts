import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppPermissionsController } from './service-app-permissions.controller';

describe('ServiceAppPermissionsController', () => {
    let controller: ServiceAppPermissionsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppPermissionsController],
        }).compile();

        controller = module.get<ServiceAppPermissionsController>(ServiceAppPermissionsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
