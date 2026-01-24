import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesController } from './app-roles.controller';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { AppRolesService } from '../service/app-roles.service';
import { AppRoleWithPermissionsResponseDto } from './dto/app-role-with-permissions-response.dto';

describe('AppRolesController', () => {
    let controller: AppRolesController;
    const mockAppRolesService = {
        createRole: jest.fn(),
        getAllRoles: jest.fn(),
        getRole: jest.fn(),
        updateRole: jest.fn(),
        deleteRole: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppRolesController],
            providers: [{ provide: AppRolesService, useValue: mockAppRolesService }],
        })
            .overrideGuard(JwtAppAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AppPermissionGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AppRolesController>(AppRolesController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createRole', () => {
        const user = { id: 1, appId: 2 };
        const role = {
            id: 3,
            name: 'mock-role-name',
            description: 'mock-role-description',
            permissions: [],
        };
        const createRoleDto = {
            name: 'mock-role-name',
            description: 'mock-role-description',
            permissionIds: [],
        };

        it('should successfully create role', async () => {
            mockAppRolesService.createRole.mockResolvedValue(role);

            const result = await controller.createRole(user, createRoleDto);

            expect(mockAppRolesService.createRole).toHaveBeenCalledWith(
                user.appId,
                createRoleDto.name,
                createRoleDto.description,
                createRoleDto.permissionIds,
            );

            expect(result).toBeInstanceOf(AppRoleWithPermissionsResponseDto);
            expect(result).toMatchObject({
                id: role.id,
            });
        });
    });
});
