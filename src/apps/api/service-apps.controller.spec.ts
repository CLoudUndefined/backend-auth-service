import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppsController } from './service-apps.controller';

describe('ServiceAppsController', () => {
    let controller: ServiceAppsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppsController],
        }).compile();

        controller = module.get<ServiceAppsController>(ServiceAppsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
