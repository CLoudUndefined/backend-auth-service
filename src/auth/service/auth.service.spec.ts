import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    const mockServiceUsersRepository = {
        existsByEmail: jest.fn(),
        create: jest.fn(),
        createRecovery: jest.fn(),
        createRefreshToken: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        deleteAllUserRefreshTokens: jest.fn(),
        findRefreshTokenByHash: jest.fn(),
        deleteRefreshToken: jest.fn(),
        findRecoveriesByUserId: jest.fn(),
        updateRecovery: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn(),
    };
    const mockConfigService = {
        getOrThrow: jest.fn(),
    };
    const mockBcrypt = jest.mocked(bcrypt);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: ServiceUsersRepository, useValue: mockServiceUsersRepository },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const userId = 1;
        const email = 'developer@example.com';
        const plainPassword = 'mock-plain-password';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';
        const expiresIn = '7d';

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should throw ConflictException if user with email already exists', async () => {
            mockServiceUsersRepository.existsByEmail.mockResolvedValue(true);
            await expect(service.register(email, plainPassword)).rejects.toThrow(ConflictException);
        });

        it('should successfully register user without recovery question and answer', async () => {
            mockServiceUsersRepository.existsByEmail.mockResolvedValue(false);

            mockBcrypt.hash.mockResolvedValue('mock-hash-value');

            mockServiceUsersRepository.create.mockResolvedValue({ id: userId });

            mockJwtService.sign.mockReturnValueOnce('mock-access-token').mockReturnValueOnce('mock-refresh-token');

            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-refresh-secret')
                .mockReturnValueOnce(expiresIn)
                .mockReturnValueOnce(expiresIn);

            const result = await service.register(email, plainPassword);
            const expectedRefreshHash = crypto.createHash('sha256').update('mock-refresh-token').digest('hex');

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expectedRefreshHash,
                expect.any(Date),
            );

            expect(mockServiceUsersRepository.existsByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);

            expect(mockServiceUsersRepository.create).toHaveBeenCalledWith(email, 'mock-hash-value', false);
            expect(mockServiceUsersRepository.createRecovery).not.toHaveBeenCalled();

            expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, { sub: userId });
            expect(mockJwtService.sign).toHaveBeenNthCalledWith(
                2,
                { sub: userId },
                { secret: 'mock-refresh-secret', expiresIn },
            );

            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(1, 'JWT_REFRESH_SECRET');
            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(2, 'JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');
            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(3, 'JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');

            expect(result).toEqual({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
        });

        it('should successfully register user with recovery question and answer', async () => {
            mockServiceUsersRepository.existsByEmail.mockResolvedValue(false);

            mockBcrypt.hash
                .mockResolvedValueOnce('mock-hash-password')
                .mockResolvedValueOnce('mock-hash-recovery-answer');

            mockServiceUsersRepository.create.mockResolvedValue({ id: userId });

            mockJwtService.sign.mockReturnValueOnce('mock-access-token').mockReturnValueOnce('mock-refresh-token');

            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-refresh-secret')
                .mockReturnValueOnce(expiresIn)
                .mockReturnValueOnce(expiresIn);

            const result = await service.register(email, plainPassword, recoveryQuestion, recoveryAnswer);
            const expectedRefreshHash = crypto.createHash('sha256').update('mock-refresh-token').digest('hex');

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expectedRefreshHash,
                expect.any(Date),
            );

            expect(mockServiceUsersRepository.existsByEmail).toHaveBeenCalledWith(email);

            expect(bcrypt.hash).toHaveBeenNthCalledWith(1, plainPassword, 10);
            expect(mockServiceUsersRepository.create).toHaveBeenCalledWith(email, 'mock-hash-password', false);

            expect(bcrypt.hash).toHaveBeenNthCalledWith(2, recoveryAnswer, 10);
            expect(mockServiceUsersRepository.createRecovery).toHaveBeenCalledWith(
                userId,
                recoveryQuestion,
                'mock-hash-recovery-answer',
            );

            expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, { sub: userId });
            expect(mockJwtService.sign).toHaveBeenNthCalledWith(
                2,
                { sub: userId },
                { secret: 'mock-refresh-secret', expiresIn },
            );

            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(1, 'JWT_REFRESH_SECRET');
            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(2, 'JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');
            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(3, 'JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');

            expect(result).toEqual({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
        });
    });

    describe('login', () => {
        const userId = 1;
        const email = 'develop@example.com';
        const plainPassword = 'mock-plain-password';
        const expiresIn = '7d';

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should throw UnauthorizedException if user not found with email', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);

            await expect(service.login(email, plainPassword)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it('should throw ForbiddenException if user is banned', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ isBanned: true });

            await expect(service.login(email, plainPassword)).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it('should throw UnauthorizedException if password is wrong', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({
                id: userId,
                isBanned: false,
                passwordHash: 'mock-password-hash',
            });

            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.login(email, plainPassword)).rejects.toThrow(UnauthorizedException);

            expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, 'mock-password-hash');
        });

        it('should successfully login user', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({
                id: userId,
                isBanned: false,
                passwordHash: 'mock-password-hash',
            });
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValueOnce('mock-access-token').mockReturnValueOnce('mock-refresh-token');
            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-refresh-secret')
                .mockReturnValueOnce(expiresIn)
                .mockReturnValueOnce(expiresIn);

            const result = await service.login(email, plainPassword);
            const expectedRefreshHash = crypto.createHash('sha256').update('mock-refresh-token').digest('hex');

            expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, 'mock-password-hash');

            expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, { sub: userId });
            expect(mockJwtService.sign).toHaveBeenNthCalledWith(
                2,
                { sub: userId },
                { secret: 'mock-refresh-secret', expiresIn },
            );

            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(1, 'JWT_REFRESH_SECRET');
            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(2, 'JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');
            expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(3, 'JWT_REFRESH_TOKEN_EXPIRES_IN', '7d');

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expectedRefreshHash,
                expect.any(Date),
            );

            expect(result).toEqual({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
        });
    });
});
