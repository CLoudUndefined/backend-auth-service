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
        deleteRecovery: jest.fn(),
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

        jest.clearAllMocks();
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
        const jwtToken = 'mock-jwt-token';

        beforeEach(async () => {
            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-hash-hex'),
            }));
            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-secret')
                .mockReturnValueOnce('7d')
                .mockReturnValueOnce('7d');
        });

        it('should throw ConflictException if user with email already exists', async () => {
            mockServiceUsersRepository.existsByEmail.mockResolvedValue(true);

            await expect(service.register(email, plainPassword)).rejects.toThrow(ConflictException);

            expect(mockServiceUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should successfully register user without recovery question and answer', async () => {
            mockServiceUsersRepository.existsByEmail.mockResolvedValue(false);
            mockServiceUsersRepository.create.mockResolvedValue({ id: userId });
            mockJwtService.sign.mockReturnValue(jwtToken);

            const result = await service.register(email, plainPassword);

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(jwtToken),
                expect.any(Date),
            );
            expect(mockServiceUsersRepository.create).toHaveBeenCalledWith(
                email,
                expect.not.stringMatching(plainPassword),
                false,
            );
            expect(mockServiceUsersRepository.createRecovery).not.toHaveBeenCalled();

            const expiresAt = mockServiceUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({ accessToken: jwtToken, refreshToken: jwtToken });
        });

        it('should successfully register user with recovery question and answer', async () => {
            mockServiceUsersRepository.existsByEmail.mockResolvedValue(false);
            mockServiceUsersRepository.create.mockResolvedValue({ id: userId });
            mockJwtService.sign.mockReturnValue(jwtToken);

            const result = await service.register(email, plainPassword, recoveryQuestion, recoveryAnswer);

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(jwtToken),
                expect.any(Date),
            );
            expect(mockServiceUsersRepository.create).toHaveBeenCalledWith(
                email,
                expect.not.stringMatching(plainPassword),
                false,
            );
            expect(mockServiceUsersRepository.createRecovery).toHaveBeenCalledWith(
                userId,
                recoveryQuestion,
                expect.not.stringMatching(recoveryAnswer),
            );

            const expiresAt = mockServiceUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({ accessToken: jwtToken, refreshToken: jwtToken });
        });
    });

    describe('login', () => {
        const userId = 1;
        const email = 'develop@example.com';
        const plainPassword = 'mock-plain-password';
        const passwordHash = 'mock-password-hash';
        const jwtToken = 'mock-jwt-token';

        beforeEach(async () => {
            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-secret')
                .mockReturnValueOnce('7d')
                .mockReturnValueOnce('7d');
        });

        it('should throw UnauthorizedException if user not found with email', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);

            await expect(service.login(email, plainPassword)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user is banned', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ isBanned: true });

            await expect(service.login(email, plainPassword)).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if password is wrong', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({
                id: userId,
                isBanned: false,
                passwordHash: passwordHash,
            });

            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.login(email, plainPassword)).rejects.toThrow(UnauthorizedException);
        });

        it('should successfully login user', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({
                id: userId,
                isBanned: false,
                passwordHash: passwordHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(jwtToken);

            const result = await service.login(email, plainPassword);

            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(jwtToken),
                expect.any(Date),
            );

            const expiresAt = mockServiceUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({ accessToken: jwtToken, refreshToken: jwtToken });
        });
    });

    describe('changePassword', () => {
        const userId = 1;
        const oldPassword = 'mock-old-password';
        const newPassword = 'mock-new-password';

        it('should throw NotFoundException if refresh token not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if old and new passwords are the same', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-password-hash',
            });

            await expect(service.changePassword(userId, oldPassword, oldPassword)).rejects.toThrow(BadRequestException);

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
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

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should successfully change password and delete all refresh tokens', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-old-password-hash',
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.changePassword(userId, oldPassword, newPassword);

            expect(mockServiceUsersRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: expect.not.stringMatching(newPassword),
            });
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith(userId);
        });
    });

    describe('refreshToken', () => {
        const recoveryId = 1;
        const userId = 2;
        const refreshToken = 'mock-refresh-token';
        const newJwtToken = 'mock-new-jwt-token';

        beforeEach(() => {
            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-token-hash'),
            }));

            mockConfigService.getOrThrow
                .mockReturnValueOnce('mock-secret')
                .mockReturnValueOnce('7d')
                .mockReturnValueOnce('7d');
        });

        it('should throw NotFoundException if refresh token not found in database', async () => {
            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue(undefined);

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(NotFoundException);

            expect(mockServiceUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.createRefreshToken).not.toHaveBeenCalled();
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

            expect(mockServiceUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should successfully refresh tokens and rotate refresh token', async () => {
            mockServiceUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                isBanned: false,
            });
            mockJwtService.sign.mockReturnValue(newJwtToken);

            const result = await service.refreshToken(refreshToken);

            expect(mockServiceUsersRepository.deleteRefreshToken).toHaveBeenCalledWith(recoveryId);
            expect(mockServiceUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(newJwtToken),
                expect.any(Date),
            );

            const expiresAt = mockServiceUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({
                accessToken: newJwtToken,
                refreshToken: newJwtToken,
            });
        });
    });

    describe('addRecovery', () => {
        const userId = 1;
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';

        it('should successfully add recovery question and answer', async () => {
            await service.addRecovery(userId, recoveryQuestion, recoveryAnswer);

            expect(mockServiceUsersRepository.createRecovery).toHaveBeenCalledWith(
                userId,
                recoveryQuestion,
                expect.not.stringMatching(recoveryAnswer),
            );
        });
    });

    describe('listRecovery', () => {
        const userId = 1;
        const recoveries = [
            { id: 1, question: 'mock-recovery-question-1', answerHash: 'mock-recovery-answer-hash-1' },
            { id: 2, question: 'mock-recovery-question-2', answerHash: 'mock-recovery.answer-hash-2' },
        ];

        it('should return list of recovery questions with id and question only', async () => {
            mockServiceUsersRepository.findRecoveriesByUserId.mockResolvedValue(recoveries);

            const result = await service.listRecovery(userId);

            expect(result).toEqual({
                questions: [
                    { id: recoveries[0].id, question: recoveries[0].question },
                    { id: recoveries[1].id, question: recoveries[1].question },
                ],
            });
        });
    });

    describe('askRecoveryQuestions', () => {
        const email = 'developer@example.com';
        const userId = 1;
        const recoveries = [
            { id: 2, question: 'mock-recovery-question-1', answerHash: 'mock-recovery-answer-hash-1' },
            { id: 3, question: 'mock-recovery-question-2', answerHash: 'mock-recovery.answer-hash-2' },
        ];

        it('should throw NotFoundException if user not found with email', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);

            await expect(service.askRecoveryQuestions(email)).rejects.toThrow(NotFoundException);
        });

        it('should return list of recovery questions with id and question only', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveriesByUserId.mockResolvedValue(recoveries);

            const result = await service.askRecoveryQuestions(email);

            expect(result).toEqual({
                questions: [
                    { id: recoveries[0].id, question: recoveries[0].question },
                    { id: recoveries[1].id, question: recoveries[1].question },
                ],
            });
        });
    });

    describe('resetPasswordByRecovery', () => {
        const recoveryId = 1;
        const userId = 2;
        const anotherUserId = 3;
        const email = 'developer@example.com';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';
        const recoveryAnswerHash = 'mock-recovery-answer-hash';
        const newPassword = 'mock-new-password';

        it('should throw UnauthorizedException if user is not found', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue(undefined);
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: 'mock-recovery-answer-hash',
            });

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if recovery is not found', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if recovery answer is incorrect', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(
                service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.update).not.toHaveBeenCalled();
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should successfully reset password and delete all refresh tokens', async () => {
            mockServiceUsersRepository.findByEmail.mockResolvedValue({ id: userId });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.resetPasswordByRecovery(recoveryId, email, recoveryAnswer, newPassword);

            expect(mockServiceUsersRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: expect.not.stringMatching(newPassword),
            });
            expect(mockServiceUsersRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith(userId);
        });
    });

    describe('updateRecovery', () => {
        const recoveryId = 1;
        const userId = 2;
        const anotherUserId = 3;
        const currentPassword = 'mock-current-password';
        const passwordHash = 'mock-password-hash';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswerHash = 'mock-recovery-answer-hash';
        const newRecoveryQuestion = 'mock-new-recovery-question';
        const newRecoveryAnswer = 'mock-new-recovery-answer';

        it('should throw UnathorizedException if user is not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answer: recoveryAnswerHash,
            });

            await expect(
                service.updateRecovery(userId, recoveryId, currentPassword, newRecoveryQuestion, newRecoveryAnswer),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnathorizedException if recovery is not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, passwordHash });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(
                service.updateRecovery(userId, recoveryId, currentPassword, newRecoveryQuestion, newRecoveryAnswer),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, passwordHash: 'hash' });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(
                service.updateRecovery(userId, recoveryId, currentPassword, newRecoveryQuestion, newRecoveryAnswer),
            ).rejects.toThrow(ForbiddenException);

            expect(mockServiceUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if current password is incorrect', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash,
            });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(
                service.updateRecovery(userId, recoveryId, currentPassword, newRecoveryQuestion, newRecoveryAnswer),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockServiceUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should successfully update recovery question and answer', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({
                id: userId,
                passwordHash,
            });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.updateRecovery(userId, recoveryId, currentPassword, newRecoveryQuestion, newRecoveryAnswer);

            expect(mockServiceUsersRepository.updateRecovery).toHaveBeenCalledWith(recoveryId, {
                question: newRecoveryQuestion,
                answerHash: expect.not.stringMatching(newRecoveryAnswer),
            });
        });
    });

    describe('removeRecovery', () => {
        const recoveryId = 1;
        const userId = 2;
        const anotherUserId = 3;
        const passwordHash = 'mock-password-hash';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswerHash = 'mock-recovery-answer-hash';
        const currentPassword = 'mock-current-password';

        it('should throw UnauthorizedException if user is not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue(undefined);
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(service.removeRecovery(userId, recoveryId, currentPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.findById).toHaveBeenCalledWith(userId);
            expect(mockServiceUsersRepository.findRecoveryById).toHaveBeenCalledWith(recoveryId);
        });

        it('should throw UnauthorizedException if recovery is not found', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, passwordHash });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(service.removeRecovery(userId, recoveryId, currentPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, passwordHash });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(service.removeRecovery(userId, recoveryId, currentPassword)).rejects.toThrow(
                ForbiddenException,
            );

            expect(mockServiceUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if current password is incorrect', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, passwordHash });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.removeRecovery(userId, recoveryId, currentPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockServiceUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should successfully delete recovery', async () => {
            mockServiceUsersRepository.findById.mockResolvedValue({ id: userId, passwordHash });
            mockServiceUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.removeRecovery(userId, recoveryId, currentPassword);

            expect(mockServiceUsersRepository.deleteRecovery).toHaveBeenCalledWith(recoveryId);
        });
    });
});
