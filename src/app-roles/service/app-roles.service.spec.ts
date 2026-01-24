import { Test, TestingModule } from '@nestjs/testing';
import { AppRolesService } from './app-roles.service';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { AppPermissionsRepository } from 'src/database/repositories/app-permissions.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

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
});
