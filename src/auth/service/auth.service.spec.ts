import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ServiceUsersRepository } from 'src/database/repositories/service-users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
    createHash: jest.fn(),
}));

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
        findRecoveryById: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn(),
    };
    const mockConfigService = {
        getOrThrow: jest.fn(),
    };
    const mockBcrypt = jest.mocked(bcrypt);
    const mockCryptoCreateHash = jest.mocked(crypto.createHash);

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

            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-hash-hex'),
            }));
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

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                'mock-hash-hex',
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

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');

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

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                'mock-hash-hex',
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

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');

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

            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-hash-hex'),
            }));
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

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                'mock-hash-hex',
                expect.any(Date),
            );

            expect(result).toEqual({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
        });
    });

    describe('changePassword', () => {
        const userId = 1;
        const oldPassword = 'mock-old-password';
        const newPassword = 'mock-new-password';

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should throw NotFoundException if refresh token not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw BadRequestException if old and new passwords are the same', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-password-hash',
            });

            await expect(service.changePassword(userId, oldPassword, oldPassword)).rejects.toThrow(BadRequestException);
        });

        it('should throw UnauthorizedException if old password is incorrect', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-password-hash',
            });

            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
            expect(bcrypt.compare).toHaveBeenCalledWith(oldPassword, 'mock-password-hash');
        });

        it('should successfully change password and delete all refresh tokens', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-old-password-hash',
            });

            mockBcrypt.compare.mockResolvedValue(true);
            mockBcrypt.hash.mockResolvedValue('mock-new-password-hash');

            await service.changePassword(userId, oldPassword, newPassword);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
            expect(bcrypt.compare).toHaveBeenCalledWith(oldPassword, 'mock-old-password-hash');
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(mockServiceUsersRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: 'mock-new-password-hash',
            });
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith(userId);
        });
    });

    describe('refreshToken', () => {
        const recoveryId = 1;
        const userId = 2;
        const refreshToken = 'mock-refresh-token';
        const expiresIn = '7d';

        beforeEach(() => {
            jest.clearAllMocks();

            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-refresh-token-hash'),
            }));
        });

        it('should throw NotFoundException if refresh token not found in database', async () => {
            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue(undefined);

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(NotFoundException);

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');
            expect(mockServiceUsersRepository.findRefreshTokenByHash).toHaveBeenCalledWith('mock-refresh-token-hash');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findRefreshTokenByHash).toHaveBeenCalledWith('mock-refresh-token-hash');
            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw ForbiddenException if user is banned', async () => {
            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                isBanned: true,
            });

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
        });

        it('should successfully refresh tokens and rotate refresh token', async () => {
            mockCryptoCreateHash
                .mockImplementationOnce(() => ({
                    update: jest.fn().mockReturnThis(),
                    digest: jest.fn().mockReturnValue('mock-refresh-token-hash'),
                }))
                .mockImplementationOnce(() => ({
                    update: jest.fn().mockReturnThis(),
                    digest: jest.fn().mockReturnValue('mock-new-refresh-token-hash'),
                }));

            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                isBanned: false,
            });
            mockJwtService.sign
                .mockReturnValueOnce('mock-new-access-token')
                .mockReturnValueOnce('mock-new-refresh-token');

            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-refresh-secret')
                .mockReturnValueOnce(expiresIn)
                .mockReturnValueOnce(expiresIn);

            const result = await service.refreshToken(refreshToken);

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');
            expect(mockServiceUsersRepository.findRefreshTokenByHash).toHaveBeenCalledWith('mock-refresh-token-hash');
            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockServiceUsersRepository.deleteRefreshToken).toHaveBeenCalledWith(recoveryId);
            expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, { sub: userId });
            expect(mockJwtService.sign).toHaveBeenNthCalledWith(
                2,
                { sub: userId },
                { secret: 'mock-refresh-secret', expiresIn },
            );
            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                'mock-new-refresh-token-hash',
                expect.any(Date),
            );

            expect(result).toEqual({
                accessToken: 'mock-new-access-token',
                refreshToken: 'mock-new-refresh-token',
            });
        });
    });

    describe('addRecovery', () => {
        const userId = 1;
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';

        it('should successfully add recovery question and answer', async () => {
            mockBcrypt.hash.mockResolvedValue('mock-hash-answer');

            await service.addRecovery(userId, recoveryQuestion, recoveryAnswer);

            expect(bcrypt.hash).toHaveBeenCalledWith(recoveryAnswer, 10);
            expect(mockServiceUsersRepository.createRecovery).toHaveBeenCalledWith(
                userId,
                recoveryQuestion,
                'mock-hash-answer',
            );
        });
    });

    describe('listRecovery', () => {
        const userId = 1;
        const mockRecoveries = [
            { id: 1, question: 'mock-recovery-question-1', answerHash: 'mock-recovery-answer-hash-1' },
            { id: 2, question: 'mock-recovery-question-2', answerHash: 'mock-recovery.answer-hash-2' },
        ];

        it('should return list of recovery questions with id and question only', async () => {
            mockServiceUsersRepository.findRecoveriesByUserId.mockResolvedValue(mockRecoveries);

            const result = await service.listRecovery(userId);

            expect(mockServiceUsersRepository.findRecoveriesByUserId).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                questions: [
                    { id: 1, question: 'mock-recovery-question-1' },
                    { id: 2, question: 'mock-recovery-question-2' },
                ],
            });
        });
    });

    describe('askRecoveryQuestions', () => {
        const email = 'developer@example.com';
        const userId = 3;
        const mockRecoveries = [
            { id: 1, question: 'mock-recovery-question-1', answerHash: 'mock-recovery-answer-hash-1' },
            { id: 2, question: 'mock-recovery-question-2', answerHash: 'mock-recovery.answer-hash-2' },
        ];

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should throw NotFoundException if user not found with email', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);

            await expect(service.askRecoveryQuestions(email)).rejects.toThrow(NotFoundException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
        });

        it('should return list of recovery questions with id and question only', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveriesByUserId.mockResolvedValue(mockRecoveries);

            const result = await service.askRecoveryQuestions(email);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockServiceUsersRepository.findRecoveriesByUserId).toHaveBeenCalledWith(userId);
            expect(result).toEqual({
                questions: [
                    { id: 1, question: 'mock-recovery-question-1' },
                    { id: 2, question: 'mock-recovery-question-2' },
                ],
            });
        });
    });

    describe('resetPasswordByRecovery', () => {
        const recoveryId = 1;
        const userId = 2;
        const anotherUserId = 3;
        const email = 'developer@example.com';
        const recoveryAnswer = 'mock-recovery-answer';
        const newPassword = 'mock-new-password';

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: 'mock-recovery-question',
                answerHash: 'mock-recovery-answer-hash',
            });

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockServiceUsersRepository.findRecoveryById).toHaveBeenCalledWith(recoveryId);
        });

        it('should throw UnauthorizedException if recovery is not found', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockServiceUsersRepository.findRecoveryById).toHaveBeenCalledWith(recoveryId);
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: 'mock-recovery-question',
                answerHash: 'mock-recovery-answer-hash',
            });

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockServiceUsersRepository.findRecoveryById).toHaveBeenCalledWith(recoveryId);
        });

        it('should throw UnauthorizedException if recovery answer is incorrect', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: 'mock-recovery-question',
                answerHash: 'mock-recovery-answer-hash',
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(bcrypt.compare).toHaveBeenCalledWith(recoveryAnswer, 'mock-recovery-answer-hash');
        });

        it('should successfully reset password and delete all refresh tokens', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: 'mock-recovery-question',
                answerHash: 'mock-recovery-answer-hash',
            });
            mockBcrypt.compare.mockResolvedValue(true);
            mockBcrypt.hash.mockResolvedValue('mock-new-password-hash');

            await service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(recoveryAnswer, 'mock-recovery-answer-hash');
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(mockServiceUsersRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: 'mock-new-password-hash',
            });
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith(userId);
        });
    });
});
