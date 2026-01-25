import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppsController } from './service-apps.controller';
import { AppsService } from '../service/apps.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { IsGodGuard } from 'src/auth/guards/is-god.guard';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';
import { AppResponseDto } from './dto/app-response.dto';

describe('ServiceAppsController', () => {
    let controller: ServiceAppsController;
    const mockAppsService = {
        createApp: jest.fn(),
        findAllApps: jest.fn(),
        findAppById: jest.fn(),
        updateApp: jest.fn(),
        deleteApp: jest.fn(),
        regenerateSecret: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppsController],
            providers: [{ provide: AppsService, useValue: mockAppsService }],
        })
            .overrideGuard(JwtServiceAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(IsGodGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AppAccessGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ServiceAppsController>(ServiceAppsController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createApp', () => {
        const user = { id: 1 };
        const createAppDto = {
            name: 'mock-app-name',
            description: 'mock-app-description',
        };
        const app = {
            id: 2,
            name: 'mock-app-name',
            description: 'mock-app-description',
            owner: { id: user.id },
        };

        it('should successfully create app', async () => {
            mockAppsService.createApp.mockResolvedValue(app);

            const result = await controller.createApp(user, createAppDto);

            expect(mockAppsService.createApp).toHaveBeenCalledWith(
                user.id,
                createAppDto.name,
                createAppDto.description,
            );

            expect(result).toBeInstanceOf(AppResponseDto);
            expect(result).toMatchObject({
                id: app.id,
            });
        });
    });

    describe('findAllApps', () => {
        const apps = [
            { id: 1, owner: { id: 2 } },
            { id: 3, owner: { id: 3 } },
        ];

        it('should successfully return all apps', async () => {
            mockAppsService.findAllApps.mockResolvedValue(apps);

            const result = await controller.findAllApps();

            expect(mockAppsService.findAllApps).toHaveBeenCalledWith();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(AppResponseDto);
            expect(result[1]).toBeInstanceOf(AppResponseDto);
            expect(result[0]).toMatchObject({
                id: apps[0].id,
            });
            expect(result[1]).toMatchObject({
                id: apps[1].id,
            });
        });
    });

    describe('findAppById', () => {
        const appId = 1;
        const app = {
            id: appId,
            name: 'mock-app-name',
            description: 'mock-app-description',
            owner: { id: 2 },
        };

        it('should successfully return app by id', async () => {
            mockAppsService.findAppById.mockResolvedValue(app);

            const result = await controller.findAppById(appId);

            expect(mockAppsService.findAppById).toHaveBeenCalledWith(appId);

            expect(result).toBeInstanceOf(AppResponseDto);
            expect(result).toMatchObject({
                id: app.id,
            });
        });
    });

    describe('updateApp', () => {
        const appId = 1;
        const updateDto = {
            name: 'mock-new-app-name',
            description: 'mock-new-app-description',
        };
        const updatedApp = {
            id: appId,
            name: 'mock-new-app-name',
            description: 'mock-new-app-description',
            owner: { id: 2 },
        };

        it('should successfully update app', async () => {
            mockAppsService.updateApp.mockResolvedValue(updatedApp);

            const result = await controller.updateApp(appId, updateDto);

            expect(mockAppsService.updateApp).toHaveBeenCalledWith(appId, updateDto.name, updateDto.description);

            expect(result).toBeInstanceOf(AppResponseDto);
            expect(result).toMatchObject({
                id: updatedApp.id,
            });
        });
    });

    describe('deleteApp', () => {
        const appId = 1;

        it('should successfully delete app and return success message', async () => {
            mockAppsService.deleteApp.mockResolvedValue(undefined);

            const result = await controller.deleteApp(appId);

            expect(mockAppsService.deleteApp).toHaveBeenCalledWith(appId);

            expect(result).toEqual({ message: 'Applicationication deleted successfully' });
        });
    });

    describe('regenerateSecret', () => {
        const appId = 1;

        it('should successfully regenerate secret and return success message', async () => {
            mockAppsService.regenerateSecret.mockResolvedValue(undefined);

            const result = await controller.regenerateSecret(appId);

            expect(mockAppsService.regenerateSecret).toHaveBeenCalledWith(appId);

            expect(result).toEqual({ message: 'Application secret regenerated successfully' });
        });
    });
});
