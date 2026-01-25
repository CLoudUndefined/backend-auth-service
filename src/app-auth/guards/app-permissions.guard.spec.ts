import { Test, TestingModule } from '@nestjs/testing';
import { AppPermissionGuard } from './app-permissions.guard';
import { Reflector } from '@nestjs/core';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AppPermissionGuard', () => {
    let guard: AppPermissionGuard;
    const mockReflector = {
        get: jest.fn(),
    };
    const mockAppUsersRepository = {
        findByIdInAppWithRolesAndPermissions: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppPermissionGuard,
                { provide: Reflector, useValue: mockReflector },
                { provide: AppUsersRepository, useValue: mockAppUsersRepository },
            ],
        }).compile();

        guard = module.get<AppPermissionGuard>(AppPermissionGuard);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    const createMockExecutionContext = (user: { id: number; appId: number } | undefined): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: () => ({}),
        } as ExecutionContext;
    };

    describe('canActivate', () => {
        const userId = 1;
        const appId = 2;
        const user = { id: userId, appId };
        const permissionName = 'mock-permission-name';
        const otherPermissionName = 'mock-another-permission-name';

        it('should return true if no permissions required', async () => {
            mockReflector.get.mockReturnValue(undefined);
            const context = createMockExecutionContext(user);

            const result = await guard.canActivate(context);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).not.toHaveBeenCalled();

            expect(result).toBe(true);
        });

        it('should return true if empty permissions array required', async () => {
            mockReflector.get.mockReturnValue([]);
            const context = createMockExecutionContext(user);

            const result = await guard.canActivate(context);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).not.toHaveBeenCalled();

            expect(result).toBe(true);
        });

        it('should throw UnauthorizedException if user not in request', async () => {
            mockReflector.get.mockReturnValue([permissionName]);
            const context = createMockExecutionContext(undefined);

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if app user not found', async () => {
            mockReflector.get.mockReturnValue([permissionName]);
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue(null);
            const context = createMockExecutionContext(user);

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.findByIdInAppWithRolesAndPermissions).toHaveBeenCalledWith(appId, userId);
        });

        it('should throw ForbiddenException if user lacks required permission', async () => {
            mockReflector.get.mockReturnValue([permissionName]);
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue({
                roles: [
                    {
                        permissions: [{ name: otherPermissionName }],
                    },
                ],
            });
            const context = createMockExecutionContext(user);

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        });

        it('should return true if user has required permission', async () => {
            mockReflector.get.mockReturnValue([permissionName]);
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue({
                roles: [
                    {
                        permissions: [{ name: permissionName }, { name: otherPermissionName }],
                    },
                ],
            });
            const context = createMockExecutionContext(user);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return true if user has all required permissions across multiple roles', async () => {
            mockReflector.get.mockReturnValue([permissionName, otherPermissionName]);
            mockAppUsersRepository.findByIdInAppWithRolesAndPermissions.mockResolvedValue({
                roles: [{ permissions: [{ name: permissionName }] }, { permissions: [{ name: otherPermissionName }] }],
            });
            const context = createMockExecutionContext(user);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });
    });
});
