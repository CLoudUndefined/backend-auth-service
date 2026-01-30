import { Test, TestingModule } from '@nestjs/testing';
import { IsGodGuard } from './is-god.guard';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('IsGodGuard', () => {
    let guard: IsGodGuard;
    const mockServiceUsersRepository = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IsGodGuard, { provide: ServiceUsersRepository, useValue: mockServiceUsersRepository }],
        }).compile();

        guard = module.get<IsGodGuard>(IsGodGuard);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    const createMockExecutionContext = (userId: number | undefined): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: userId ? { id: userId } : undefined,
                }),
            }),
        } as ExecutionContext;
    };

    describe('canActivate', () => {
        const userId = 1;

        it('should throw UnauthorizedException if user is not in request', async () => {
            const context = createMockExecutionContext(undefined);

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findById).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(null);
            const context = createMockExecutionContext(userId);

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw ForbiddenException if user is not god', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, isGod: false });
            const context = createMockExecutionContext(userId);

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should return true if user is god', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, isGod: true });
            const context = createMockExecutionContext(userId);

            const result = await guard.canActivate(context);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);

            expect(result).toBe(true);
        });
    });
});
