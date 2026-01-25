import { Test, TestingModule } from '@nestjs/testing';
import { AppAuthService } from './app-auth.service';
import { AppUsersRepository } from 'src/database/repositories/app-users.repository';
import { AppsRepository } from 'src/database/repositories/apps.repository';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
    createHash: jest.fn(),
}));

describe('AppAuthService', () => {
    let service: AppAuthService;
    const mockAppUsersRepository = {
        findById: jest.fn(),
        findByIdInApp: jest.fn(),
        findByEmailInApp: jest.fn(),
        exists: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        createRecovery: jest.fn(),
        findRecoveriesByUserId: jest.fn(),
        findRecoveryById: jest.fn(),
        updateRecovery: jest.fn(),
        deleteRecovery: jest.fn(),
        createRefreshToken: jest.fn(),
        findRefreshTokenByHash: jest.fn(),
        deleteRefreshToken: jest.fn(),
        deleteAllUserRefreshTokens: jest.fn(),
    };
    const mockAppsRepository = {
        findById: jest.fn(),
    };
    const mockConfigService = {
        getOrThrow: jest.fn(),
    };
    const mockEncryptionService = {
        decrypt: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn(),
    };
    const mockBcrypt = jest.mocked(bcrypt);
    const mockCryptoCreateHash = jest.mocked(crypto.createHash);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppAuthService,
                { provide: AppUsersRepository, useValue: mockAppUsersRepository },
                { provide: AppsRepository, useValue: mockAppsRepository },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: EncryptionService, useValue: mockEncryptionService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AppAuthService>(AppAuthService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const appId = 1;
        const userId = 2;
        const email = 'developer@example.com';
        const plainPassword = 'mock-plain-password';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';
        const jwtAccessToken = 'mock-access-token';
        const jwtRefreshToken = 'mock-refresh-token';
        const encryptedSecret = 'mock-encrypted-secret';
        const decryptedSecret = 'mock-decrypted-secret';

        beforeEach(async () => {
            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-hash-hex'),
            }));
            mockConfigService.getOrThrow.mockReturnValueOnce('mock-secret').mockReturnValueOnce('7d');
        });

        it('should throw NotFoundException if app is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.register(appId, email, plainPassword)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.create).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRecovery).not.toHaveBeenCalled();
        });

        it('should throw ConflictException if user with email already exists', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.exists.mockResolvedValue(true);

            await expect(service.register(appId, email, plainPassword)).rejects.toThrow(ConflictException);

            expect(mockAppUsersRepository.create).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRecovery).not.toHaveBeenCalled();
        });

        it('should successfully register user without recovery question and answer', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.exists.mockResolvedValue(false);
            mockAppUsersRepository.create.mockResolvedValue({ id: userId });
            mockJwtService.sign.mockReturnValueOnce(jwtAccessToken).mockReturnValueOnce(jwtRefreshToken);
            mockEncryptionService.decrypt.mockReturnValue(decryptedSecret);

            const result = await service.register(appId, email, plainPassword);

            expect(mockAppUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(jwtRefreshToken),
                expect.any(Date),
            );
            expect(mockAppUsersRepository.create).toHaveBeenCalledWith(
                appId,
                email,
                expect.not.stringMatching(plainPassword),
            );
            expect(mockAppUsersRepository.createRecovery).not.toHaveBeenCalled();

            const expiresAt = mockAppUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({ accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
        });

        it('should successfully register user with recovery question and answer', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.exists.mockResolvedValue(false);
            mockAppUsersRepository.create.mockResolvedValue({ id: userId });
            mockJwtService.sign.mockReturnValueOnce(jwtAccessToken).mockReturnValueOnce(jwtRefreshToken);
            mockEncryptionService.decrypt.mockReturnValue(decryptedSecret);

            const result = await service.register(appId, email, plainPassword, recoveryQuestion, recoveryAnswer);

            expect(mockAppUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(jwtRefreshToken),
                expect.any(Date),
            );
            expect(mockAppUsersRepository.create).toHaveBeenCalledWith(
                appId,
                email,
                expect.not.stringMatching(plainPassword),
            );
            expect(mockAppUsersRepository.createRecovery).toHaveBeenCalledWith(
                userId,
                recoveryQuestion,
                expect.not.stringMatching(recoveryAnswer),
            );

            const expiresAt = mockAppUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({ accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
        });
    });

    describe('login', () => {
        const appId = 1;
        const userId = 2;
        const email = 'develop@example.com';
        const plainPassword = 'mock-plain-password';
        const passwordHash = 'mock-password-hash';
        const jwtAccessToken = 'mock-access-token';
        const jwtRefreshToken = 'mock-refresh-token';
        const encryptedSecret = 'mock-encrypted-secret';
        const decryptedSecret = 'mock-decrypted-secret';

        beforeEach(async () => {
            mockConfigService.getOrThrow.mockReturnValueOnce('mock-secret').mockReturnValueOnce('7d');
        });

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.login(appId, email, plainPassword)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user not found with email', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(undefined);

            await expect(service.login(appId, email, plainPassword)).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user is banned', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({ isBanned: true });

            await expect(service.login(appId, email, plainPassword)).rejects.toThrow(ForbiddenException);

            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if password is wrong', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({
                id: userId,
                isBanned: false,
                passwordHash: passwordHash,
            });

            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.login(appId, email, plainPassword)).rejects.toThrow(UnauthorizedException);
        });

        it('should successfully login user', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({
                id: userId,
                isBanned: false,
                passwordHash: passwordHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValueOnce(jwtAccessToken).mockReturnValueOnce(jwtRefreshToken);
            mockEncryptionService.decrypt.mockReturnValue(decryptedSecret);

            const result = await service.login(appId, email, plainPassword);

            expect(mockAppUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(jwtRefreshToken),
                expect.any(Date),
            );

            const expiresAt = mockAppUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({ accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
        });
    });

    describe('changePassword', () => {
        const appId = 1;
        const userId = 2;
        const oldPassword = 'mock-old-password';
        const newPassword = 'mock-new-password';

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.changePassword(appId, userId, oldPassword, newPassword)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if refresh token not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(undefined);

            await expect(service.changePassword(appId, userId, oldPassword, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if old and new passwords are the same', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-password-hash',
            });

            await expect(service.changePassword(appId, userId, oldPassword, oldPassword)).rejects.toThrow(
                BadRequestException,
            );

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if old password is incorrect', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-password-hash',
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.changePassword(appId, userId, oldPassword, newPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should successfully change password and delete all refresh tokens', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                passwordHash: 'mock-old-password-hash',
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.changePassword(appId, userId, oldPassword, newPassword);

            expect(mockAppUsersRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: expect.not.stringMatching(newPassword),
            });
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith(userId);
        });
    });

    describe('refreshToken', () => {
        const appId = 1;
        const recoveryId = 2;
        const userId = 3;
        const refreshToken = 'mock-refresh-token';
        const newJwtToken = 'mock-new-jwt-token';
        const encryptedSecret = 'mock-encrypted-secret';
        const decryptedSecret = 'mock-decrypted-secret';

        beforeEach(() => {
            mockCryptoCreateHash.mockImplementation(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('mock-token-hash'),
            }));

            mockConfigService.getOrThrow.mockReturnValueOnce('mock-secret').mockReturnValueOnce('7d');
        });

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.refreshToken(appId, refreshToken)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if refresh token not found in database', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findRefreshTokenByHash.mockResolvedValue(undefined);

            await expect(service.refreshToken(appId, refreshToken)).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(undefined);

            await expect(service.refreshToken(appId, refreshToken)).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if user is banned', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                isBanned: true,
            });

            await expect(service.refreshToken(appId, refreshToken)).rejects.toThrow(ForbiddenException);

            expect(mockAppUsersRepository.deleteRefreshToken).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.createRefreshToken).not.toHaveBeenCalled();
        });

        it('should successfully refresh tokens and rotate refresh token', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId, encryptedSecret });
            mockAppUsersRepository.findRefreshTokenByHash.mockResolvedValue({
                id: recoveryId,
                userId: userId,
            });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                isBanned: false,
            });
            mockJwtService.sign.mockReturnValue(newJwtToken);
            mockEncryptionService.decrypt.mockReturnValue(decryptedSecret);

            const result = await service.refreshToken(appId, refreshToken);

            expect(mockAppUsersRepository.deleteRefreshToken).toHaveBeenCalledWith(recoveryId);
            expect(mockAppUsersRepository.createRefreshToken).toHaveBeenCalledWith(
                userId,
                expect.not.stringMatching(newJwtToken),
                expect.any(Date),
            );

            const expiresAt = mockAppUsersRepository.createRefreshToken.mock.calls[0][2];
            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

            expect(result).toEqual({
                accessToken: newJwtToken,
                refreshToken: newJwtToken,
            });
        });
    });

    describe('addRecovery', () => {
        const appId = 1;
        const userId = 2;
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.addRecovery(appId, userId, recoveryQuestion, recoveryAnswer)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppUsersRepository.createRecovery).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if user not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(undefined);

            await expect(service.addRecovery(appId, userId, recoveryQuestion, recoveryAnswer)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppUsersRepository.createRecovery).not.toHaveBeenCalled();
        });

        it('should successfully add recovery question and answer', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId });

            await service.addRecovery(appId, userId, recoveryQuestion, recoveryAnswer);

            expect(mockAppUsersRepository.createRecovery).toHaveBeenCalledWith(
                userId,
                recoveryQuestion,
                expect.not.stringMatching(recoveryAnswer),
            );
        });
    });

    describe('listRecovery', () => {
        const appId = 1;
        const userId = 2;
        const recoveries = [
            { id: 3, question: 'mock-recovery-question-1', answerHash: 'mock-recovery-answer-hash-1' },
            { id: 4, question: 'mock-recovery-question-2', answerHash: 'mock-recovery.answer-hash-2' },
        ];

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.listRecovery(appId, userId)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(undefined);

            await expect(service.listRecovery(appId, userId)).rejects.toThrow(NotFoundException);
        });

        it('should return list of recovery questions with id and question only', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId });
            mockAppUsersRepository.findRecoveriesByUserId.mockResolvedValue(recoveries);

            const result = await service.listRecovery(appId, userId);

            expect(result).toEqual({
                questions: [
                    { id: recoveries[0].id, question: recoveries[0].question },
                    { id: recoveries[1].id, question: recoveries[1].question },
                ],
            });
        });
    });

    describe('askRecoveryQuestions', () => {
        const appId = 1;
        const userId = 2;
        const email = 'developer@example.com';
        const recoveries = [
            { id: 3, question: 'mock-recovery-question-1', answerHash: 'mock-recovery-answer-hash-1' },
            { id: 4, question: 'mock-recovery-question-2', answerHash: 'mock-recovery.answer-hash-2' },
        ];

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.askRecoveryQuestions(appId, email)).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if user not found with email', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(undefined);

            await expect(service.askRecoveryQuestions(appId, email)).rejects.toThrow(NotFoundException);
        });

        it('should return list of recovery questions with id and question only', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({ id: userId });
            mockAppUsersRepository.findRecoveriesByUserId.mockResolvedValue(recoveries);

            const result = await service.askRecoveryQuestions(appId, email);

            expect(result).toEqual({
                questions: [
                    { id: recoveries[0].id, question: recoveries[0].question },
                    { id: recoveries[1].id, question: recoveries[1].question },
                ],
            });
        });
    });

    describe('resetPasswordByRecovery', () => {
        const appId = 1;
        const recoveryId = 2;
        const userId = 3;
        const anotherUserId = 4;
        const email = 'developer@example.com';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswer = 'mock-recovery-answer';
        const recoveryAnswerHash = 'mock-recovery-answer-hash';
        const newPassword = 'mock-new-password';

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(
                service.resetPasswordByRecovery(appId, recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue(undefined);
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: 'mock-recovery-answer-hash',
            });

            await expect(
                service.resetPasswordByRecovery(appId, recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if recovery is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({ id: userId });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(
                service.resetPasswordByRecovery(appId, recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({ id: userId });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(
                service.resetPasswordByRecovery(appId, recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(ForbiddenException);

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if recovery answer is incorrect', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({ id: userId });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(
                service.resetPasswordByRecovery(appId, recoveryId, email, recoveryAnswer, newPassword),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.update).not.toHaveBeenCalled();
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).not.toHaveBeenCalled();
        });

        it('should successfully reset password and delete all refresh tokens', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByEmailInApp.mockResolvedValue({ id: userId });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.resetPasswordByRecovery(appId, recoveryId, email, recoveryAnswer, newPassword);

            expect(mockAppUsersRepository.update).toHaveBeenCalledWith(userId, {
                passwordHash: expect.not.stringMatching(newPassword),
            });
            expect(mockAppUsersRepository.deleteAllUserRefreshTokens).toHaveBeenCalledWith(userId);
        });
    });

    describe('updateRecovery', () => {
        const appId = 1;
        const recoveryId = 2;
        const userId = 3;
        const anotherUserId = 4;
        const currentPassword = 'mock-current-password';
        const passwordHash = 'mock-password-hash';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswerHash = 'mock-recovery-answer-hash';
        const newRecoveryQuestion = 'mock-new-recovery-question';
        const newRecoveryAnswer = 'mock-new-recovery-answer';

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(
                service.updateRecovery(
                    appId,
                    userId,
                    recoveryId,
                    currentPassword,
                    newRecoveryQuestion,
                    newRecoveryAnswer,
                ),
            ).rejects.toThrow(NotFoundException);

            expect(mockAppUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should throw UnathorizedException if user is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(undefined);
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answer: recoveryAnswerHash,
            });

            await expect(
                service.updateRecovery(
                    appId,
                    userId,
                    recoveryId,
                    currentPassword,
                    newRecoveryQuestion,
                    newRecoveryAnswer,
                ),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnathorizedException if recovery is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId, passwordHash });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(
                service.updateRecovery(
                    appId,
                    userId,
                    recoveryId,
                    currentPassword,
                    newRecoveryQuestion,
                    newRecoveryAnswer,
                ),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId, passwordHash: 'hash' });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(
                service.updateRecovery(
                    appId,
                    userId,
                    recoveryId,
                    currentPassword,
                    newRecoveryQuestion,
                    newRecoveryAnswer,
                ),
            ).rejects.toThrow(ForbiddenException);

            expect(mockAppUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if current password is incorrect', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                passwordHash,
            });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(
                service.updateRecovery(
                    appId,
                    userId,
                    recoveryId,
                    currentPassword,
                    newRecoveryQuestion,
                    newRecoveryAnswer,
                ),
            ).rejects.toThrow(UnauthorizedException);

            expect(mockAppUsersRepository.updateRecovery).not.toHaveBeenCalled();
        });

        it('should successfully update recovery question and answer', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({
                id: userId,
                passwordHash,
            });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.updateRecovery(
                appId,
                userId,
                recoveryId,
                currentPassword,
                newRecoveryQuestion,
                newRecoveryAnswer,
            );

            expect(mockAppUsersRepository.updateRecovery).toHaveBeenCalledWith(recoveryId, {
                question: newRecoveryQuestion,
                answerHash: expect.not.stringMatching(newRecoveryAnswer),
            });
        });
    });

    describe('removeRecovery', () => {
        const appId = 1;
        const recoveryId = 2;
        const userId = 3;
        const anotherUserId = 4;
        const passwordHash = 'mock-password-hash';
        const recoveryQuestion = 'mock-recovery-question';
        const recoveryAnswerHash = 'mock-recovery-answer-hash';
        const currentPassword = 'mock-current-password';

        it('should throw NotFoundException if app not found', async () => {
            mockAppsRepository.findById.mockResolvedValue(undefined);

            await expect(service.removeRecovery(appId, userId, recoveryId, currentPassword)).rejects.toThrow(
                NotFoundException,
            );

            expect(mockAppUsersRepository.create).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue(undefined);
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(service.removeRecovery(appId, userId, recoveryId, currentPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAppUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if recovery is not found', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId, passwordHash });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue(undefined);

            await expect(service.removeRecovery(appId, userId, recoveryId, currentPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAppUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if recovery does not belong to user', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId, passwordHash });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: anotherUserId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });

            await expect(service.removeRecovery(appId, userId, recoveryId, currentPassword)).rejects.toThrow(
                ForbiddenException,
            );

            expect(mockAppUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if current password is incorrect', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId, passwordHash });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(false);

            await expect(service.removeRecovery(appId, userId, recoveryId, currentPassword)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAppUsersRepository.deleteRecovery).not.toHaveBeenCalled();
        });

        it('should successfully delete recovery', async () => {
            mockAppsRepository.findById.mockResolvedValue({ id: appId });
            mockAppUsersRepository.findByIdInApp.mockResolvedValue({ id: userId, passwordHash });
            mockAppUsersRepository.findRecoveryById.mockResolvedValue({
                id: recoveryId,
                userId: userId,
                question: recoveryQuestion,
                answerHash: recoveryAnswerHash,
            });
            mockBcrypt.compare.mockResolvedValue(true);

            await service.removeRecovery(appId, userId, recoveryId, currentPassword);

            expect(mockAppUsersRepository.deleteRecovery).toHaveBeenCalledWith(recoveryId);
        });
    });
});
