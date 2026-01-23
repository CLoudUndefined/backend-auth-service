import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersService } from './app-users.service';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

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
    const mockAppsRepository = {
        findById: jest.fn(),
    };
    const mockServiceUsersRepository = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppUsersService,
                { provide: AppUsersRepository, useValue: mockAppUsersRepository },
                { provide: AppRolesRepository, useValue: mockAppRolesRepository },
                { provide: AppsRepository, useValue: mockAppsRepository },
                { provide: ServiceUsersRepository, useValue: mockServiceUsersRepository },
            ],
        }).compile();

        service = module.get<AppUsersService>(AppUsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('listAppUsersByServiceUser', () => {
        const appId = 1;
        const serviceUserId = 2;
        const roleId = 3;
        const anotherServiceUserId = 4;
        const users = [
            { id: 1, email: 'application-user-1@app.com', roles: [{ id: roleId }] },
            { id: 2, email: 'application-user-2@app.com', roles: [{ id: roleId }] },
        ];

        it('should throw UnauthorizedException if service user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.listAppUsersByServiceUser(appId, serviceUserId)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
        });

        it('should throw NotFoundException if application not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId });
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.listAppUsersByServiceUser(appId, serviceUserId)).rejects.toThrow(NotFoundException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should throw ForbiddenException if service user is not god and not app owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });

            await expect(service.listAppUsersByServiceUser(appId, serviceUserId)).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should successfully return all app users when owner and no roleId provided', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findAllByAppWithRoles.mockResolvedValue(users);

            const result = await service.listAppUsersByServiceUser(appId, serviceUserId);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findAllByAppWithRoles).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findUsersByRoleWithRoles).not.toHaveBeenCalled();

            expect(result).toEqual(users);
        });

        it('should successfully return filtered app users when owner and roleId provided', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findUsersByRoleWithRoles.mockResolvedValue(users);

            const result = await service.listAppUsersByServiceUser(appId, serviceUserId, roleId);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findUsersByRoleWithRoles).toHaveBeenCalledWith(appId, roleId);

            expect(result).toEqual(users);
        });

        it('should successfully return all app users when god and no roleId provided', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: true });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });
            mockAppUsersRepository.findAllByAppWithRoles.mockResolvedValue(users);

            const result = await service.listAppUsersByServiceUser(appId, serviceUserId);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findAllByAppWithRoles).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findUsersByRoleWithRoles).not.toHaveBeenCalled();

            expect(result).toEqual(users);
        });

        it('should successfully return filtered app users when god and roleId provided', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: true });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });
            mockAppUsersRepository.findUsersByRoleWithRoles.mockResolvedValue(users);

            const result = await service.listAppUsersByServiceUser(appId, serviceUserId, roleId);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findUsersByRoleWithRoles).toHaveBeenCalledWith(appId, roleId);

            expect(result).toEqual(users);
        });
    });

    describe('getAppUserByServiceUser', () => {
        const appId = 1;
        const serviceUserId = 2;
        const appUserId = 3;
        const anotherServiceUserId = 4;
        const appUser = {
            id: appUserId,
            email: 'application-user@app.com',
            roles: [{ id: 1, name: 'mock-role-name', permissions: [] }],
        };

        it('should throw UnauthorizedException if service user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.getAppUserByServiceUser(appId, serviceUserId, appUserId)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
        });

        it('should throw NotFoundException if application not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId });
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.getAppUserByServiceUser(appId, serviceUserId, appUserId)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should throw ForbiddenException if service user is not god and not app owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });

            await expect(service.getAppUserByServiceUser(appId, serviceUserId, appUserId)).rejects.toThrow(
                ForbiddenException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should throw NotFoundException if app user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(null);

            await expect(service.getAppUserByServiceUser(appId, serviceUserId, appUserId)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).toHaveBeenCalledWith(appId, appUserId);
        });

        it('should successfully return app user when owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(appUser);

            const result = await service.getAppUserByServiceUser(appId, serviceUserId, appUserId);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).toHaveBeenCalledWith(appId, appUserId);
            expect(result).toEqual(appUser);
        });

        it('should successfully return app user when god user', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: true });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(appUser);

            const result = await service.getAppUserByServiceUser(appId, serviceUserId, appUserId);

            expect(result).toEqual(appUser);
        });
    });

    describe('updateAppUserByServiceUser', () => {
        const appId = 1;
        const serviceUserId = 2;
        const appUserId = 3;
        const anotherServiceUserId = 4;
        const anotherAppUserId = 5;
        const email = 'application-user@example.com';
        const newEmail = 'new-application-user@example.com';

        it('should throw UnauthorizedException if service user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, email)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
        });

        it('should throw NotFoundException if application not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId });
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, email)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should throw ForbiddenException if service user is not god and not app owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });

            await expect(service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, email)).rejects.toThrow(
                ForbiddenException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(serviceUserId);
            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should throw NotFoundException if app user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(null);

            await expect(service.getAppUserByServiceUser(appId, serviceUserId, appUserId)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).toHaveBeenCalledWith(appId, appUserId);
        });

        it('should throw ConflictException if new email already exists in app', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({
                id: anotherAppUserId,
                email: 'new-application-user@example.com',
            });

            await expect(
                service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, 'new-application-user@example.com'),
            ).rejects.toThrow(ConflictException);

            expect(mockAppUsersRepository.findByEmailInApp).toHaveBeenCalledWith(
                appId,
                'new-application-user@example.com',
            );
            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
        });

        it('should return existing user without update if email unchanged', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });

            const result = await service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, email);

            expect(mockAppUsersRepository.findByEmailInApp).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(result).toEqual({ id: appUserId, email });
        });

        it('should successfully update app user email when owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: serviceUserId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(null);
            mockAppUsersRepository.update.mockResolvedValue({
                id: appUserId,
                email: newEmail,
            });

            const result = await service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, newEmail);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppUsersRepository.findByEmailInApp).toHaveBeenCalledWith(appId, newEmail);
            expect(mockAppUsersRepository.update).toHaveBeenCalledWith(appUserId, { email: newEmail });
            expect(result).toEqual({ id: appUserId, email: newEmail });
        });

        it('should successfully update app user email when god', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: serviceUserId, isGod: true });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: anotherServiceUserId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: appUserId,
                email,
            });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(null);
            mockAppUsersRepository.update.mockResolvedValue({
                id: appUserId,
                email: newEmail,
            });

            const result = await service.updateAppUserByServiceUser(appId, serviceUserId, appUserId, newEmail);

            expect(mockAppUsersRepository.findByIdInApp).toHaveBeenCalledWith(appId, appUserId);
            expect(mockAppUsersRepository.findByEmailInApp).toHaveBeenCalledWith(appId, newEmail);
            expect(mockAppUsersRepository.update).toHaveBeenCalledWith(appUserId, { email: newEmail });
            expect(result).toEqual({ id: appUserId, email: newEmail });
        });
    });
});
