import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersController } from './app-users.controller';
import { AppUsersService } from '../service/app-users.service';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions-response.dto';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { AppRoleWithPermissionsResponseDto } from 'src/app-roles/api/dto/app-role-with-permissions-response.dto';

describe('AppUsersController', () => {
    let controller: AppUsersController;
    const mockAppUsersService = {
        listAppUsers: jest.fn(),
        getAppUser: jest.fn(),
        updateAppUser: jest.fn(),
        deleteAppUser: jest.fn(),
        getAppUserRoles: jest.fn(),
        addRoleToAppUser: jest.fn(),
        removeRoleFromAppUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppUsersController],
            providers: [{ provide: AppUsersService, useValue: mockAppUsersService }],
        })
            .overrideGuard(JwtAppAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AppPermissionGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AppUsersController>(AppUsersController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listAppUsers', () => {
        const roleId = 1;
        const user = { id: 2, appId: 3 };
        const appUsers = [
            { id: 4, roles: [{ id: roleId }] },
            { id: 5, roles: [{ id: 6 }] },
        ];

        it('should successfully call service with appId and undefined roleId when no filter provided', async () => {
            mockAppUsersService.listAppUsers.mockResolvedValue(appUsers);

            const result = await controller.listAppUsers(user, {});

            expect(mockAppUsersService.listAppUsers).toHaveBeenCalledWith(user.appId, undefined);

            expect(result).toHaveLength(appUsers.length);
            expect(result[0]).toBeInstanceOf(AppUserWithRolesResponseDto);
            expect(result[1]).toBeInstanceOf(AppUserWithRolesResponseDto);
            expect(result[0]).toMatchObject({
                id: appUsers[0].id,
            });
            expect(result[1]).toMatchObject({
                id: appUsers[1].id,
            });
        });

        it('should successfully pass roleId to service when filter is provided', async () => {
            mockAppUsersService.listAppUsers.mockResolvedValue([appUsers[0]]);

            const result = await controller.listAppUsers(user, { roleId });

            expect(mockAppUsersService.listAppUsers).toHaveBeenCalledWith(user.appId, roleId);
            expect(result[0]).toBeInstanceOf(AppUserWithRolesResponseDto);
            expect(result).toHaveLength(1);
        });
    });

    describe('getAppUser', () => {
        const appUserId = 1;
        const user = { id: 2, appId: 3 };
        const appUser = { id: appUserId, roles: [] };

        it('should successfully return app user details and call service with correct params', async () => {
            mockAppUsersService.getAppUser.mockResolvedValue(appUser);

            const result = await controller.getAppUser(user, appUserId);

            expect(mockAppUsersService.getAppUser).toHaveBeenCalledWith(user.appId, appUserId);

            expect(result).toBeInstanceOf(AppUserWithRolesAndPermissionsResponseDto);
            expect(result).toMatchObject({
                id: appUser.id,
            });
        });
    });

    describe('updateAppUser', () => {
        const user = { id: 1, appId: 2 };
        const email = 'new-application-user@example.com';
        const appUser = { id: 3, email };

        it('should successfully update app user email', async () => {
            mockAppUsersService.updateAppUser.mockResolvedValue(appUser);

            const result = await controller.updateAppUser(user, appUser.id, { email });

            expect(mockAppUsersService.updateAppUser).toHaveBeenCalledWith(user.appId, appUser.id, email);

            expect(result).toBeInstanceOf(AppUserResponseDto);
            expect(result).toMatchObject({
                id: appUser.id,
            });
        });
    });

    describe('getAppUserRoles', () => {
        const user = { id: 1, appId: 2 };
        const appUserId = 3;
        const roles = [
            { id: 4, permissions: [] },
            { id: 5, permissions: [] },
        ];

        it('should successfully return roles assigned to app user', async () => {
            mockAppUsersService.getAppUserRoles.mockResolvedValue(roles);

            const result = await controller.getAppUserRoles(user, appUserId);

            expect(mockAppUsersService.getAppUserRoles).toHaveBeenCalledWith(user.appId, appUserId);

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(AppRoleWithPermissionsResponseDto);
            expect(result[1]).toBeInstanceOf(AppRoleWithPermissionsResponseDto);
            expect(result[0]).toMatchObject({ id: roles[0].id });
            expect(result[1]).toMatchObject({ id: roles[1].id });
        });
    });

    describe('addRoleToAppUser', () => {
        const user = { id: 1, appId: 2 };
        const appUserId = 3;
        const roleId = 4;

        it('should successfully add role to app user and return success message', async () => {
            mockAppUsersService.addRoleToAppUser.mockResolvedValue(undefined);

            const result = await controller.addRoleToAppUser(user, appUserId, roleId);

            expect(mockAppUsersService.addRoleToAppUser).toHaveBeenCalledWith(user.appId, appUserId, roleId);

            expect(result).toEqual({ message: 'Role added successfully' });
        });
    });

    describe('removeRoleFromAppUser', () => {
        const user = { id: 1, appId: 2 };
        const appUserId = 3;
        const roleId = 4;

        it('should successfully remove role from app user and return success message', async () => {
            mockAppUsersService.removeRoleFromAppUser.mockResolvedValue(undefined);

            const result = await controller.removeRoleFromAppUser(user, appUserId, roleId);

            expect(mockAppUsersService.removeRoleFromAppUser).toHaveBeenCalledWith(user.appId, appUserId, roleId);

            expect(result).toEqual({ message: 'Role removed successfully' });
        });
    });
});
