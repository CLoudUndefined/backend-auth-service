import { Test, TestingModule } from '@nestjs/testing';
import { AppsController } from './apps.controller';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { AppsService } from '../service/apps.service';
import { AppResponseDto } from './dto/app-response.dto';

describe('AppsController', () => {
    let controller: AppsController;
    const mockAppsService = {
        findAppById: jest.fn(),
        updateApp: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppsController],
            providers: [{ provide: AppsService, useValue: mockAppsService }],
        })
            .overrideGuard(JwtAppAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AppPermissionGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AppsController>(AppsController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getApp', () => {
        const user = { id: 1, appId: 2 };
        const app = {
            id: user.appId,
            name: 'mock-app-name',
            description: 'mock-app-description',
            owner: { id: 3 },
        };

        it('should successfully return app info', async () => {
            mockAppsService.findAppById.mockResolvedValue(app);

            const result = await controller.getApp(user);

            expect(mockAppsService.findAppById).toHaveBeenCalledWith(user.appId);

            expect(result).toBeInstanceOf(AppResponseDto);
            expect(result).toMatchObject({
                id: app.id,
            });
        });
    });

    describe('updateApp', () => {
        const user = { id: 1, appId: 2 };
        const updateDto = {
            name: 'mock-new-app-name',
            description: 'mock-new-app-description',
        };
        const updatedApp = {
            id: user.appId,
            name: 'mock-new-app-name',
            description: 'mock-new-app-description',
            owner: { id: 3 },
        };

        it('should successfully update app', async () => {
            mockAppsService.updateApp.mockResolvedValue(updatedApp);

            const result = await controller.updateApp(user, updateDto);

            expect(mockAppsService.updateApp).toHaveBeenCalledWith(user.appId, updateDto.name, updateDto.description);

            expect(result).toBeInstanceOf(AppResponseDto);
            expect(result).toMatchObject({
                id: updatedApp.id,
            });
        });
    });
});
