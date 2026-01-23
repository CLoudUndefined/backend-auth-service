import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersService } from './app-users.service';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { AppRolesRepository } from 'src/database/repositories/app-roles.repository';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

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
});
