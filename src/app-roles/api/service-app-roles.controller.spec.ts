import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppRolesController } from './service-app-roles.controller';
import { AppRolesService } from '../service/app-roles.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';
import { AppRoleWithPermissionsResponseDto } from './dto/app-role-with-permissions-response.dto';
import { AppRoleResponseDto } from './dto/app-role-response.dto';

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

    describe('getAllRoles', () => {
        const appId = 1;
        const roles = [{ id: 2 }, { id: 3 }];

        it('should successfully return all roles for app', async () => {
            mockAppRolesService.getAllRoles.mockResolvedValue(roles);

            const result = await controller.getAllRoles(appId);

            expect(mockAppRolesService.getAllRoles).toHaveBeenCalledWith(appId);

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(AppRoleResponseDto);
            expect(result[1]).toBeInstanceOf(AppRoleResponseDto);
            expect(result[0]).toMatchObject({ id: roles[0].id });
            expect(result[1]).toMatchObject({ id: roles[1].id });
        });
    });

    describe('getRole', () => {
        const appId = 1;
        const roleId = 2;
        const role = {
            id: roleId,
            permissions: [{ id: 3 }, { id: 4 }],
        };

        it('should successfully return role details', async () => {
            mockAppRolesService.getRole.mockResolvedValue(role);

            const result = await controller.getRole(appId, roleId);

            expect(mockAppRolesService.getRole).toHaveBeenCalledWith(appId, roleId);

            expect(result).toBeInstanceOf(AppRoleWithPermissionsResponseDto);
            expect(result).toMatchObject({
                id: role.id,
            });
        });
    });

    describe('updateRole', () => {
        const appId = 1;
        const roleId = 2;
        const updatedRole = {
            id: roleId,
            name: 'mock-new-role-name',
            description: 'mock-new-role-description',
            permissions: [{ id: 1 }, { id: 2 }],
        };
        const updateRoleDto = {
            name: 'mock-new-role-name',
            description: 'mock-new-role-description',
            permissionIds: [1, 2],
        };

        it('should successfully update role', async () => {
            mockAppRolesService.updateRole.mockResolvedValue(updatedRole);

            const result = await controller.updateRole(appId, roleId, updateRoleDto);

            expect(mockAppRolesService.updateRole).toHaveBeenCalledWith(
                appId,
                roleId,
                updateRoleDto.name,
                updateRoleDto.description,
                updateRoleDto.permissionIds,
            );

            expect(result).toBeInstanceOf(AppRoleWithPermissionsResponseDto);
            expect(result).toMatchObject({
                id: updatedRole.id,
            });
        });
    });

    describe('deleteRole', () => {
        const appId = 1;
        const roleId = 2;

        it('should successfully delete role and return success message', async () => {
            mockAppRolesService.deleteRole.mockResolvedValue(undefined);

            const result = await controller.deleteRole(appId, roleId);

            expect(mockAppRolesService.deleteRole).toHaveBeenCalledWith(appId, roleId);

            expect(result).toEqual({ message: 'Role deleted successfully' });
        });
    });
});
