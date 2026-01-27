import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesController } from './app-roles.controller';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { AppRolesService } from '../service/app-roles.service';
import { AppRoleWithPermissionsResponseDto } from './dto/app-role-with-permissions-response.dto';
import { AppRoleResponseDto } from './dto/app-role-response.dto';

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

    describe('getAllRoles', () => {
        const user = { id: 1, appId: 2 };
        const roles = [{ id: 3 }, { id: 4 }];

        it('should successfully return all roles for app', async () => {
            mockAppRolesService.getAllRoles.mockResolvedValue(roles);

            const result = await controller.getAllRoles(user);

            expect(mockAppRolesService.getAllRoles).toHaveBeenCalledWith(user.appId);

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(AppRoleResponseDto);
            expect(result[1]).toBeInstanceOf(AppRoleResponseDto);
            expect(result[0]).toMatchObject({ id: roles[0].id });
            expect(result[1]).toMatchObject({ id: roles[1].id });
        });
    });

    describe('getRole', () => {
        const user = { id: 1, appId: 2 };
        const roleId = 3;
        const role = {
            id: roleId,
            permissions: [{ id: 4 }, { id: 5 }],
        };

        it('should successfully return role details', async () => {
            mockAppRolesService.getRole.mockResolvedValue(role);

            const result = await controller.getRole(user, roleId);

            expect(mockAppRolesService.getRole).toHaveBeenCalledWith(user.appId, roleId);

            expect(result).toBeInstanceOf(AppRoleWithPermissionsResponseDto);
            expect(result).toMatchObject({
                id: role.id,
            });
        });
    });

    describe('updateRole', () => {
        const user = { id: 1, appId: 2 };
        const roleId = 3;
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

            const result = await controller.updateRole(user, roleId, updateRoleDto);

            expect(mockAppRolesService.updateRole).toHaveBeenCalledWith(
                user.appId,
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
        const user = { id: 1, appId: 2 };
        const roleId = 3;

        it('should successfully delete role and return success message', async () => {
            mockAppRolesService.deleteRole.mockResolvedValue(undefined);

            const result = await controller.deleteRole(user, roleId);

            expect(mockAppRolesService.deleteRole).toHaveBeenCalledWith(user.appId, roleId);

            expect(result).toEqual({ message: 'Role deleted successfully' });
        });
    });
});
