import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesService } from './app-roles.service';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('AppRolesService', () => {
    let service: AppRolesService;
    const mockAppRolesRepository = {
        existsByNameInApp: jest.fn(),
        existsByIdInApp: jest.fn(),
        createWithPermissions: jest.fn(),
        findAllByApp: jest.fn(),
        findByIdInApp: jest.fn(),
        findByIdWithPermissionsInApp: jest.fn(),
        update: jest.fn(),
        setPermissions: jest.fn(),
        hasUsers: jest.fn(),
        delete: jest.fn(),
    };
    const mockAppPermissionsRepository = {
        findExistingIds: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppRolesService,
                { provide: AppRolesRepository, useValue: mockAppRolesRepository },
                { provide: AppPermissionsRepository, useValue: mockAppPermissionsRepository },
            ],
        }).compile();

        service = module.get<AppRolesService>(AppRolesService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createRole', () => {
        const appId = 1;
        const name = 'mock-role-name';
        const description = 'mock-role-description';
        const existingPermissionIds = [1, 2, 3];
        const uniquePermissionIds = [1, 2, 3];
        const duplicatePermissionIds = [1, 2, 2, 3, 3, 1];
        const createdRole = {
            id: 2,
            name,
            permissions: [],
        };
        const createdRoleWithDescription = {
            id: 2,
            name,
            description,
            permissions: [],
        };
        const createdRoleWithPermissions = {
            id: 2,
            name,
            permissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
        };

        it('should throw ConflictException if role name already exists', async () => {
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(true);

            await expect(service.createRole(appId, name)).rejects.toThrow(ConflictException);

            expect(mockAppRolesRepository.existsByNameInApp).toHaveBeenCalledWith(appId, name);
        });

        it('should throw NotFoundException if some permissions do not exist', async () => {
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue(existingPermissionIds);

            await expect(service.createRole(appId, name, description, [1, 2, 3, 4])).rejects.toThrow(NotFoundException);

            expect(mockAppRolesRepository.existsByNameInApp).toHaveBeenCalledWith(appId, name);
            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith([1, 2, 3, 4]);
        });

        it('should successfully handle duplicate permission IDs by using unique values', async () => {
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue(existingPermissionIds);
            mockAppRolesRepository.createWithPermissions.mockResolvedValue(createdRole);

            const result = await service.createRole(appId, name, undefined, duplicatePermissionIds);

            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith(uniquePermissionIds);
            expect(mockAppRolesRepository.createWithPermissions).toHaveBeenCalledWith(
                appId,
                name,
                undefined,
                existingPermissionIds,
            );

            expect(result).toEqual(createdRole);
        });

        it('should successfully create role without description and permissions', async () => {
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue([]);
            mockAppRolesRepository.createWithPermissions.mockResolvedValue(createdRole);

            const result = await service.createRole(appId, name, undefined, []);

            expect(mockAppRolesRepository.existsByNameInApp).toHaveBeenCalledWith(appId, name);
            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith([]);
            expect(mockAppRolesRepository.createWithPermissions).toHaveBeenCalledWith(appId, name, undefined, []);

            expect(result).toEqual(createdRole);
        });

        it('should successfully create role with description', async () => {
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue([]);
            mockAppRolesRepository.createWithPermissions.mockResolvedValue(createdRoleWithDescription);

            const result = await service.createRole(appId, name, description, []);

            expect(mockAppRolesRepository.existsByNameInApp).toHaveBeenCalledWith(appId, name);
            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith([]);
            expect(mockAppRolesRepository.createWithPermissions).toHaveBeenCalledWith(appId, name, description, []);

            expect(result).toEqual(createdRoleWithDescription);
        });

        it('should successfully create role with permissions', async () => {
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue(existingPermissionIds);
            mockAppRolesRepository.createWithPermissions.mockResolvedValue(createdRoleWithPermissions);

            const result = await service.createRole(appId, name, undefined, existingPermissionIds);

            expect(mockAppRolesRepository.existsByNameInApp).toHaveBeenCalledWith(appId, name);
            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith(existingPermissionIds);
            expect(mockAppRolesRepository.createWithPermissions).toHaveBeenCalledWith(
                appId,
                name,
                undefined,
                existingPermissionIds,
            );

            expect(result).toEqual(createdRoleWithPermissions);
        });
    });

    describe('getAllRoles', () => {
        const appId = 1;
        const roles = [{ id: 2 }, { id: 3 }];

        it('should successfully return all roles for app', async () => {
            mockAppRolesRepository.findAllByApp.mockResolvedValue(roles);

            const result = await service.getAllRoles(appId);

            expect(mockAppRolesRepository.findAllByApp).toHaveBeenCalledWith(appId);

            expect(result).toEqual(roles);
        });
    });

    describe('getRole', () => {
        const appId = 1;
        const roleId = 2;
        const role = {
            id: roleId,
            permissions: [{ id: 3 }, { id: 4 }],
        };

        it('should throw NotFoundException if role not found', async () => {
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(undefined);

            await expect(service.getRole(appId, roleId)).rejects.toThrow(NotFoundException);

            expect(mockAppRolesRepository.findByIdWithPermissionsInApp).toHaveBeenCalledWith(appId, roleId);
        });

        it('should successfully return role with permissions', async () => {
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(role);

            const result = await service.getRole(appId, roleId);

            expect(mockAppRolesRepository.findByIdWithPermissionsInApp).toHaveBeenCalledWith(appId, roleId);

            expect(result).toEqual(role);
        });
    });

    describe('updateRole', () => {
        const appId = 1;
        const roleId = 2;
        const existingPermissionIds = [1, 2, 3];
        const role = { id: roleId, name: 'mock-role-name', description: 'mock-role-description', permissions: [] };
        const roleWithPermissions = {
            id: roleId,
            name: 'mock-role-name',
            description: 'mock-role-description',
            permissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
        };
        const updatedRoleName = { id: roleId, name: 'mock-new-role-name', description: 'mock-role-description' };
        const updatedRoleDescription = { id: roleId, name: 'mock-role-name', description: 'mock-new-role-description' };
        const updatedRolePermissions = {
            id: roleId,
            name: 'mock-role-name',
            description: 'mock-role-description',
            permissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
        };
        const updatedRoleAll = {
            id: roleId,
            name: 'mock-new-role-name',
            description: 'mock-new-role-description',
            permissions: [{ id: 1 }, { id: 2 }, { id: 3 }],
        };

        it('should throw NotFoundException if role not found', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(null);

            await expect(service.updateRole(appId, roleId, 'mock-new-role-name')).rejects.toThrow(NotFoundException);

            expect(mockAppRolesRepository.findByIdInApp).toHaveBeenCalledWith(appId, roleId);
        });

        it('should throw BadRequestException if no fields provided', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);

            await expect(service.updateRole(appId, roleId)).rejects.toThrow(BadRequestException);

            expect(mockAppRolesRepository.findByIdInApp).toHaveBeenCalledWith(appId, roleId);
        });

        it('should throw ConflictException if new name already exists', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(true);

            await expect(service.updateRole(appId, roleId, 'mock-new-role-name')).rejects.toThrow(ConflictException);

            expect(mockAppRolesRepository.existsByNameInApp).toHaveBeenCalledWith(appId, 'mock-new-role-name');
        });

        it('should not check name conflict if name unchanged', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppRolesRepository.update.mockResolvedValue(updatedRoleDescription);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(updatedRoleDescription);

            await service.updateRole(appId, roleId, 'mock-role-name', 'mock-new-role-description');

            expect(mockAppRolesRepository.existsByNameInApp).not.toHaveBeenCalled();

            expect(mockAppRolesRepository.update).toHaveBeenCalledWith(roleId, {
                name: 'mock-role-name',
                description: 'mock-new-role-description',
            });
        });

        it('should throw NotFoundException if some permissions do not exist', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue(existingPermissionIds);

            await expect(service.updateRole(appId, roleId, undefined, undefined, [1, 2, 3, 4])).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppRolesRepository.findByIdInApp).toHaveBeenCalledWith(appId, roleId);
            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith([1, 2, 3, 4]);
        });

        it('should throw NotFoundException if updated role not found', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppRolesRepository.update.mockResolvedValue(updatedRoleName);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(undefined);

            await expect(service.updateRole(appId, roleId, 'mock-new-role-name')).rejects.toThrow(NotFoundException);

            expect(mockAppRolesRepository.update).toHaveBeenCalledWith(roleId, {
                name: 'mock-new-role-name',
                description: undefined,
            });
            expect(mockAppRolesRepository.findByIdWithPermissionsInApp).toHaveBeenCalledWith(appId, roleId);
        });

        it('should successfully update only name', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppRolesRepository.update.mockResolvedValue(updatedRoleName);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(updatedRoleName);

            const result = await service.updateRole(appId, roleId, 'mock-new-role-name');

            expect(mockAppRolesRepository.update).toHaveBeenCalledWith(roleId, {
                name: 'mock-new-role-name',
                description: undefined,
            });
            expect(mockAppRolesRepository.setPermissions).not.toHaveBeenCalled();

            expect(result).toEqual(updatedRoleName);
        });
        it('should successfully update only description', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppRolesRepository.update.mockResolvedValue(updatedRoleDescription);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(updatedRoleDescription);

            const result = await service.updateRole(appId, roleId, undefined, 'mock-new-role-description');

            expect(mockAppRolesRepository.update).toHaveBeenCalledWith(roleId, {
                name: undefined,
                description: 'mock-new-role-description',
            });
            expect(mockAppRolesRepository.setPermissions).not.toHaveBeenCalled();

            expect(result).toEqual(updatedRoleDescription);
        });

        it('should successfully update only permissions', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue(existingPermissionIds);
            mockAppRolesRepository.setPermissions.mockResolvedValue(undefined);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(updatedRolePermissions);

            const result = await service.updateRole(appId, roleId, undefined, undefined, [1, 2, 3]);

            expect(mockAppRolesRepository.update).not.toHaveBeenCalled();
            expect(mockAppPermissionsRepository.findExistingIds).toHaveBeenCalledWith([1, 2, 3]);
            expect(mockAppRolesRepository.setPermissions).toHaveBeenCalledWith(roleId, [1, 2, 3]);

            expect(result).toEqual(updatedRolePermissions);
        });

        it('should successfully update name, description and permissions', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(role);
            mockAppRolesRepository.existsByNameInApp.mockResolvedValue(false);
            mockAppPermissionsRepository.findExistingIds.mockResolvedValue([1, 2]);
            mockAppRolesRepository.update.mockResolvedValue(undefined);
            mockAppRolesRepository.setPermissions.mockResolvedValue(undefined);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(updatedRoleAll);

            const result = await service.updateRole(
                appId,
                roleId,
                'mock-new-role-name',
                'mock-new-role-description',
                [1, 2],
            );

            expect(mockAppRolesRepository.update).toHaveBeenCalledWith(roleId, {
                name: 'mock-new-role-name',
                description: 'mock-new-role-description',
            });
            expect(mockAppRolesRepository.setPermissions).toHaveBeenCalledWith(roleId, [1, 2]);

            expect(result).toEqual(updatedRoleAll);
        });

        it('should successfully clear all permissions if an empty array is provided', async () => {
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(roleWithPermissions);
            mockAppRolesRepository.setPermissions.mockResolvedValue(undefined);
            mockAppRolesRepository.findByIdWithPermissionsInApp.mockResolvedValue(role);

            const result = await service.updateRole(appId, roleId, undefined, undefined, []);

            expect(mockAppRolesRepository.update).not.toHaveBeenCalled();
            expect(mockAppPermissionsRepository.findExistingIds).not.toHaveBeenCalled();
            expect(mockAppRolesRepository.setPermissions).toHaveBeenCalledWith(roleId, []);

            expect(result).toEqual(role);
        });
    });

    describe('deleteRole', () => {
        const appId = 1;
        const roleId = 2;

        it('should throw NotFoundException if role not found', async () => {
            mockAppRolesRepository.existsByIdInApp.mockResolvedValue(false);
            mockAppRolesRepository.hasUsers.mockResolvedValue(false);

            await expect(service.deleteRole(appId, roleId)).rejects.toThrow(NotFoundException);

            expect(mockAppRolesRepository.existsByIdInApp).toHaveBeenCalledWith(appId, roleId);
        });

        it('should throw ConflictException if role is assigned to users', async () => {
            mockAppRolesRepository.existsByIdInApp.mockResolvedValue(true);
            mockAppRolesRepository.hasUsers.mockResolvedValue(true);

            await expect(service.deleteRole(appId, roleId)).rejects.toThrow(ConflictException);

            expect(mockAppRolesRepository.hasUsers).toHaveBeenCalledWith(roleId);
        });

        it('should successfully delete role', async () => {
            mockAppRolesRepository.existsByIdInApp.mockResolvedValue(true);
            mockAppRolesRepository.hasUsers.mockResolvedValue(false);
            mockAppRolesRepository.delete.mockResolvedValue(undefined);

            await service.deleteRole(appId, roleId);

            expect(mockAppRolesRepository.existsByIdInApp).toHaveBeenCalledWith(appId, roleId);
            expect(mockAppRolesRepository.hasUsers).toHaveBeenCalledWith(roleId);

            expect(mockAppRolesRepository.delete).toHaveBeenCalledWith(roleId);
        });
    });
});
