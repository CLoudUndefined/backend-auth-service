import { Test, TestingModule } from '@nestjs/testing';
import { IsSelfOrGodGuard } from './is-self-or-god.guard';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('IsSelfOrGodGuard', () => {
    let guard: IsSelfOrGodGuard;
    const mockServiceUsersRepository = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsSelfOrGodGuard, { provide: ServiceUsersRepository, useValue: mockServiceUsersRepository }],
        }).compile();

        guard = module.get<IsSelfOrGodGuard>(IsSelfOrGodGuard);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    const createMockExecutionContext = (userId: number | undefined, targetUserId: string): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: userId ? { id: userId } : undefined,
                    params: { id: targetUserId },
                }),
            }),
        } as ExecutionContext;
    };

    describe('canActivate', () => {
        const userId = 1;
        const targetUserId = 2;

        it('should throw UnauthorizedException if user is not in request', async () => {
            const context = createMockExecutionContext(undefined, userId.toString());

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findById).not.toHaveBeenCalled();
        });

        it('should return true if user is accessing their own resource', async () => {
            const context = createMockExecutionContext(userId, userId.toString());

            const result = await guard.canActivate(context);

            expect(mockServiceUsersRepository.findById).not.toHaveBeenCalled();

            expect(result).toBe(true);
        });

        it('should throw UnauthorizedException if service user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(null);
            const context = createMockExecutionContext(userId, targetUserId.toString());

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw ForbiddenException if user is accessing another resource and is not god', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, isGod: false });
            const context = createMockExecutionContext(userId, targetUserId.toString());

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should return true if user is accessing another resource and is god', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, isGod: true });
            const context = createMockExecutionContext(userId, targetUserId.toString());

            const result = await guard.canActivate(context);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);

            expect(result).toBe(true);
        });
    });
});
