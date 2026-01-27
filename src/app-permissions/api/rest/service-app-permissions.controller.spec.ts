import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppPermissionsController } from './service-app-permissions.controller';
import { AppPermissionsService } from '../service/app-permissions.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { PermissionResponseDto } from './dto/permission-response.dto';

describe('ServiceAppPermissionsController', () => {
    let controller: ServiceAppPermissionsController;
    const mockAppPermissionsService = {
        getAllPermissions: jest.fn(),
        getPermission: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppPermissionsController],
            providers: [{ provide: AppPermissionsService, useValue: mockAppPermissionsService }],
        })
            .overrideGuard(JwtServiceAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ServiceAppPermissionsController>(ServiceAppPermissionsController);

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
        const permission = { id: permissionId };

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
