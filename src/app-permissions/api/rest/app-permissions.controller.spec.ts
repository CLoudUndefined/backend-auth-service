import { Test, TestingModule } from '@nestjs/testing';
import { AppPermissionsController } from './app-permissions.controller';
import { AppPermissionsService } from '../service/app-permissions.service';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { PermissionResponseDto } from './dto/permission-response.dto';

describe('AppPermissionsController', () => {
    let controller: AppPermissionsController;
    const mockAppPermissionsService = {
        getAllPermissions: jest.fn(),
        getPermission: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppPermissionsController],
            providers: [{ provide: AppPermissionsService, useValue: mockAppPermissionsService }],
        })
            .overrideGuard(JwtAppAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AppPermissionsController>(AppPermissionsController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllPermissions', () => {
        const permissions = [{ id: 1 }, { id: 2 }];

        it('should successfully return all permissions', async () => {
            mockAppPermissionsService.getAllPermissions.mockResolvedValue(permissions);

            const result = await controller.getAllPermissions();

            expect(mockAppPermissionsService.getAllPermissions).toHaveBeenCalledWith();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(PermissionResponseDto);
            expect(result[1]).toBeInstanceOf(PermissionResponseDto);
            expect(result[0]).toMatchObject({
                id: permissions[0].id,
            });
            expect(result[1]).toMatchObject({
                id: permissions[1].id,
            });
        });
    });

    describe('getPermission', () => {
        const permissionId = 1;
        const permission = {
            id: permissionId,
        };

        it('should successfully return permission by id', async () => {
            mockAppPermissionsService.getPermission.mockResolvedValue(permission);

            const result = await controller.getPermission(permissionId);

            expect(mockAppPermissionsService.getPermission).toHaveBeenCalledWith(permissionId);

            expect(result).toBeInstanceOf(PermissionResponseDto);
            expect(result).toMatchObject({
                id: permission.id,
            });
        });
    });
});
