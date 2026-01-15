import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppRolesController } from './service-app-roles.controller';

describe('ServiceAppRolesController', () => {
    let controller: ServiceAppRolesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppRolesController],
        }).compile();

        controller = module.get<ServiceAppRolesController>(ServiceAppRolesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
