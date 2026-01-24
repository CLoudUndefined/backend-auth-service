import { Test, TestingModule } from '@nestjs/testing';
import { AppUsersController } from './app-users.controller';
import { AppUsersService } from '../service/app-users.service';
import { JwtAppAuthGuard } from 'src/app-auth/guards/jwt-app-auth.guard';
import { AppPermissionGuard } from 'src/app-auth/guards/app-permissions.guard';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions-response.dto';

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
});
