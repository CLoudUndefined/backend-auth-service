import { Test, TestingModule } from '@nestjs/testing';
import { AppAccessGuard } from './app-access.guard';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ExecutionContext, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AppAccessGuard', () => {
    let guard: AppAccessGuard;
    const mockAppsRepository = {
        findById: jest.fn(),
    };
    const mockServiceUsersRepository = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppAccessGuard,
                { provide: AppsRepository, useValue: mockAppsRepository },
                { provide: ServiceUsersRepository, useValue: mockServiceUsersRepository },
            ],
        }).compile();

        guard = module.get<AppAccessGuard>(AppAccessGuard);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    const createMockExecutionContext = (userId: number, appId: string): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { id: userId },
                    params: { appId },
                }),
            }),
        } as ExecutionContext;
    };

    describe('canActivate', () => {
        const userId = 1;
        const ownerId = 1;
        const anotherUserId = 2;
        const appId = 3;

        it('should throw NotFoundException if appId param is not a number', async () => {
            const context = createMockExecutionContext(userId, 'not a number');

            await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(null);
            const context = createMockExecutionContext(userId, appId.toString());

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException if app not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue(null);
            const context = createMockExecutionContext(userId, appId.toString());

            await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);

            expect(mockAppsRepository.findById).toHaveBeenCalledWith(appId);
        });

        it('should throw ForbiddenException if user is not god and not owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: anotherUserId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: ownerId });

            const context = createMockExecutionContext(anotherUserId, appId.toString());

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        });

        it('should return true if user is owner and not god', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: ownerId, isGod: false });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: ownerId });

            const context = createMockExecutionContext(ownerId, appId.toString());

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should return true if user is god and not owner', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: anotherUserId, isGod: true });
            mockAppsRepository.findById.mockResolvedValue({ id: appId, ownerId: ownerId });

            const context = createMockExecutionContext(anotherUserId, appId.toString());

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });
    });
});
