import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersService } from './app-users.service';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AppUsersService', () => {
    let service: AppUsersService;
    const mockAppUsersRepository = {
        findByIdInApp: jest.fn(),
        findAllByAppWithRoles: jest.fn(),
        findUsersByRoleWithRoles: jest.fn(),
        findByIdInAppWithRolesAndPermissions: jest.fn(),
        findByEmailInApp: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        hasRole: jest.fn(),
        addRole: jest.fn(),
        removeRole: jest.fn(),
    };
    const mockAppRolesRepository = {
        findByIdInApp: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppUsersService,
                { provide: AppUsersRepository, useValue: mockAppUsersRepository },
                { provide: AppRolesRepository, useValue: mockAppRolesRepository },
            ],
        }).compile();

        service = module.get<AppUsersService>(AppUsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('listAppUsers', () => {
        const appId = 1;
        const roleId = 2;
        const users = [
            { id: 1, email: 'application-user-1@app.com', roles: [{ id: roleId }] },
            { id: 2, email: 'application-user-2@app.com', roles: [{ id: roleId }] },
        ];

        it('should successfully return all app users when no roleId provided', async () => {
            mockAppUsersRepository.findAllByAppWithRoles.mockResolvedValue(users);

            const result = await service.listAppUsers(appId);

            expect(mockAppUsersRepository.findAllByAppWithRoles).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findUsersByRoleWithRoles).not.toHaveBeenCalled();

            expect(result).toEqual(users);
        });

        it('should successfully return filtered app users when roleId provided', async () => {
            mockAppUsersRepository.findUsersByRoleWithRoles.mockResolvedValue(users);

            const result = await service.listAppUsers(appId, roleId);

            expect(mockAppUsersRepository.findUsersByRoleWithRoles).toHaveBeenCalledWith(appId, roleId);
            expect(mockAppUsersRepository.findAllByAppWithRoles).not.toHaveBeenCalled();

            expect(result).toEqual(users);
        });
    });

    describe('getAppUser', () => {
        const appId = 1;
        const appUserId = 2;
        const appUser = {
            id: appUserId,
            email: 'application-user@app.com',
            roles: [{ id: 1, name: 'mock-role-name', permissions: [] }],
        };

        it('should throw NotFoundException if app user not found', async () => {
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(null);

            await expect(service.getAppUser(appId, appUserId)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).toHaveBeenCalledWith(appId, appUserId);
        });

        it('should successfully return app user', async () => {
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(appUser);

            const result = await service.getAppUser(appId, appUserId);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).toHaveBeenCalledWith(appId, appUserId);

            expect(result).toEqual(appUser);
        });
    });

    describe('updateAppUserByServiceUser', () => {
        const appId = 1;
        const appUserId = 2;
        const anotherAppUserId = 3;
        const email = 'application-user@example.com';
        const newEmail = 'new-application-user@example.com';

        it('should throw NotFoundException if app user not found', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(null);

            await expect(service.updateAppUser(appId, appUserId, email)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
        });

        it('should throw ConflictException if new email already exists in app', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({
                id: anotherAppUserId,
                email: newEmail,
            });

            await expect(service.updateAppUser(appId, appUserId, newEmail)).rejects.toThrow(ConflictException);

            expect(mockAppUsersRepository.findByEmailInApp).toHaveBeenCalledWith(appId, newEmail);
            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if updated app user not found', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(null);
            mockAppUsersRepository.update.mockResolvedValue(undefined);

            await expect(service.updateAppUser(appId, appUserId, newEmail)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppUsersRepository.findByEmailInApp).toHaveBeenCalledWith(appId, newEmail);
            expect(mockAppUsersRepository.update).toHaveBeenCalledWith(appUserId, { email: newEmail });
        });

        it('should return existing user without update if email unchanged', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });

            const result = await service.updateAppUser(appId, appUserId, email);

            expect(mockAppUsersRepository.findByEmailInApp).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();

            expect(result).toEqual({ id: appUserId, email });
        });

        it('should successfully update app user email', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(null);
            mockAppUsersRepository.update.mockResolvedValue({
                id: appUserId,
                email: newEmail,
            });

            const result = await service.updateAppUser(appId, appUserId, newEmail);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppUsersRepository.findByEmailInApp).toHaveBeenCalledWith(appId, newEmail);
            expect(mockAppUsersRepository.update).toHaveBeenCalledWith(appUserId, { email: newEmail });

            expect(result).toEqual({ id: appUserId, email: newEmail });
        });
    });

    describe('deleteAppUser', () => {
        const appId = 1;
        const appUserId = 2;

        it('should throw NotFoundException if app user not found', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(null);

            await expect(service.deleteAppUser(appId, appUserId)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
        });

        it('should successfully delete app user', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: appUserId });
            mockAppUsersRepository.delete.mockResolvedValue(undefined);

            await service.deleteAppUser(appId, appUserId);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);

            expect(mockAppUsersRepository.delete).toHaveBeenCalledWith(appUserId);
        });
    });

    describe('getAppUserRoles', () => {
        const appId = 1;
        const appUserId = 2;
        const roles = [
            { id: 1, name: 'mock-role-name-1', permissions: [] },
            { id: 2, name: 'mock-role-name-2', permissions: [] },
        ];

        it('should throw NotFoundException if app user not found', async () => {
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(null);

            await expect(service.getAppUserRoles(appId, appUserId)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId));
        });

        it('should successfully return user roles', async () => {
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue({
                roles,
            });

            const result = await service.getAppUserRoles(appId, appUserId);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions(appId, appUserId));

            expect(result).toEqual(roles);
        });
    });

    describe('addRoleToAppUser', () => {
        const appId = 1;
        const appUserId = 2;
        const roleId = 3;

        it('should throw NotFoundException if app user not found', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(null);

            await expect(service.addRoleToAppUser(appId, appUserId, roleId)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
        });

        it('should throw NotFoundException if role not found', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: appUserId });
            mockAppRolesRepository.findByIdInApp.mockResolvedValue(null);

            await expect(service.addRoleToAppUser(appId, appUserId, roleId)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppRolesRepository.findByIdInApp).toHaveBeenCalledWith(appId, roleId);
        });

        it('should throw ConflictException if user already has role', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: appUserId });
            mockAppRolesRepository.findByIdInApp.mockResolvedValue({ id: roleId });
            mockAppUsersRepository.hasRole.mockResolvedValue(true);

            await expect(service.addRoleToAppUser(appId, appUserId, roleId)).rejects.toThrow(ConflictException);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppRolesRepository.findByIdInApp).toHaveBeenCalledWith(appId, roleId);
            expect(mockAppUsersRepository.hasRole).toHaveBeenCalledWith(appUserId, roleId);
        });

        it('should successfully add role to user', async () => {
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: appUserId });
            mockAppRolesRepository.findByIdInApp.mockResolvedValue({ id: roleId });
            mockAppUsersRepository.hasRole.mockResolvedValue(false);
            mockAppUsersRepository.addRole.mockResolvedValue(undefined);

            await service.addRoleToAppUser(appId, appUserId, roleId);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppRolesRepository.findByIdInApp).toHaveBeenCalledWith(appId, roleId);
            expect(mockAppUsersRepository.hasRole).toHaveBeenCalledWith(appUserId, roleId);

            expect(mockAppUsersRepository.addRole).toHaveBeenCalledWith(appUserId, roleId);
        });
    });
});
