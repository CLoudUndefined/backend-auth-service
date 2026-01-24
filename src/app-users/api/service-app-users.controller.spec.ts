import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAppUsersController } from './service-app-users.controller';
import { AppUsersService } from '../service/app-users.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service-auth.guard';
import { AppAccessGuard } from 'src/auth/guards/app-access.guard';
import { AppUserWithRolesResponseDto } from './dto/app-user-with-roles-response.dto';
import { AppUserWithRolesAndPermissionsResponseDto } from './dto/app-user-with-roles-and-permissions-response.dto';

describe('ServiceAppUsersController', () => {
    let controller: ServiceAppUsersController;
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
            controllers: [ServiceAppUsersController],
            providers: [{ provide: AppUsersService, useValue: mockAppUsersService }],
        })
            .overrideGuard(JwtServiceAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AppAccessGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ServiceAppUsersController>(ServiceAppUsersController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listAppUsers', () => {
        const appId = 1;
        const roleId = 2;
        const appUsers = [
            { id: 3, roles: [{ id: roleId }] },
            { id: 4, roles: [{ id: 5 }] },
        ];

        it('should successfully call service with appId and undefined roleId when no filter provided', async () => {
            mockAppUsersService.listAppUsers.mockResolvedValue(appUsers);

            const result = await controller.listAppUsers(appId, {});

            expect(mockAppUsersService.listAppUsers).toHaveBeenCalledWith(appId, undefined);

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

            const result = await controller.listAppUsers(appId, { roleId });

            expect(mockAppUsersService.listAppUsers).toHaveBeenCalledWith(appId, roleId);
            expect(result[0]).toBeInstanceOf(AppUserWithRolesResponseDto);
            expect(result).toHaveLength(1);
        });
    });

    describe('getAppUser', () => {
        const appId = 1;
        const appUserId = 2;
        const appUser = { id: appUserId, roles: [] };

        it('should successfully return app user details and call service with correct params', async () => {
            mockAppUsersService.getAppUser.mockResolvedValue(appUser);

            const result = await controller.getAppUser(appId, appUserId);

            expect(mockAppUsersService.getAppUser).toHaveBeenCalledWith(appId, appUserId);

            expect(result).toBeInstanceOf(AppUserWithRolesAndPermissionsResponseDto);
            expect(result).toMatchObject({
                id: appUser.id,
            });
        });
    });
});
