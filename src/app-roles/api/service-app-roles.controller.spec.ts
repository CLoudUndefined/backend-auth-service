import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppRolesController } from './service-app-roles.controller';
import { AppRolesService } from '../service/app-roles.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';
import { AppRoleWithPermissionsResponseDto } from './dto/app-role-with-permissions-response.dto';

describe('ServiceAppRolesController', () => {
    let controller: ServiceAppRolesController;
    const mockAppRolesService = {
        createRole: jest.fn(),
        getAllRoles: jest.fn(),
        getRole: jest.fn(),
        updateRole: jest.fn(),
        deleteRole: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ServiceAppRolesController],
            providers: [{ provide: AppRolesService, useValue: mockAppRolesService }],
        })
            .overrideGuard(JwtServiceAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AppAccessGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ServiceAppRolesController>(ServiceAppRolesController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createRole', () => {
        const appId = 1;
        const role = {
            id: 2,
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

            const result = await controller.createRole(appId, createRoleDto);

            expect(mockAppRolesService.createRole).toHaveBeenCalledWith(
                appId,
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
