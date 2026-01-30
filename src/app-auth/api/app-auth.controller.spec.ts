import { Test, TestingModule } from '@nestjs/testing';
import { AppAuthController } from './app-auth.controller';
import { AppAuthService } from '../service/app-auth.service';
import { JwtAppAuthGuard } from '../guards/jwt-app-auth.guard';
import { JwtAppRefreshGuard } from '../guards/jwt-refresh.guard';

describe('AppAuthController', () => {
    let controller: AppAuthController;
    const mockAppAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        changePassword: jest.fn(),
        refreshToken: jest.fn(),
        addRecovery: jest.fn(),
        listRecovery: jest.fn(),
        askRecoveryQuestions: jest.fn(),
        resetPasswordByRecovery: jest.fn(),
        updateRecovery: jest.fn(),
        removeRecovery: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppAuthController],
            providers: [{ provide: AppAuthService, useValue: mockAppAuthService }],
        })
            .overrideGuard(JwtAppAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(JwtAppRefreshGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AppAuthController>(AppAuthController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        const appId = 1;
        const registerDto = {
            email: 'application-user@example.com',
            password: 'mock-plain-password',
            recoveryQuestion: 'mock-recovery-question',
            recoveryAnswer: 'mock-recovery-answer',
        };
        const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        it('should successfully register a new user in app, return tokens', async () => {
            mockAppAuthService.register.mockResolvedValue(tokens);

            const result = await controller.register(appId, registerDto);

            expect(mockAppAuthService.register).toHaveBeenCalledWith(
                appId,
                registerDto.email,
                registerDto.password,
                registerDto.recoveryQuestion,
                registerDto.recoveryAnswer,
            );

            expect(result).toEqual(tokens);
        });
    });

    describe('login', () => {
        const appId = 1;
        const loginDto = {
            email: 'application-user@example.com',
            password: 'mock-plain-password',
        };
        const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        it('should successfully login and return tokens', async () => {
            mockAppAuthService.login.mockResolvedValue(tokens);

            const result = await controller.login(appId, loginDto);

            expect(mockAppAuthService.login).toHaveBeenCalledWith(appId, loginDto.email, loginDto.password);

            expect(result).toEqual(tokens);
        });
    });

    describe('changePassword', () => {
        const appId = 1;
        const user = { id: 2, appId };
        const changePasswordDto = {
            oldPassword: 'mock-old-plain-password',
            newPassword: 'mock-new-plain-password',
        };

        it('should successfully change password and return success message', async () => {
            mockAppAuthService.changePassword.mockResolvedValue(undefined);

            const result = await controller.changePassword(user, appId, changePasswordDto);

            expect(mockAppAuthService.changePassword).toHaveBeenCalledWith(
                appId,
                user.id,
                changePasswordDto.oldPassword,
                changePasswordDto.newPassword,
            );

            expect(result).toEqual({ message: 'Password changed successfully' });
        });
    });

    describe('refreshToken', () => {
        const appId = 1;
        const refreshToken = 'mock-refresh-token';
        const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        it('should successfully refresh tokens', async () => {
            mockAppAuthService.refreshToken.mockResolvedValue(tokens);

            const result = await controller.refreshToken(refreshToken, appId);

            expect(mockAppAuthService.refreshToken).toHaveBeenCalledWith(appId, refreshToken);

            expect(result).toEqual(tokens);
        });
    });

    describe('addRecovery', () => {
        const appId = 1;
        const user = { id: 2, appId };
        const addRecoveryDto = {
            recoveryQuestion: 'mock-recovery-question',
            recoveryAnswer: 'mock-recovery-answer',
        };

        it('should successfully add recovery question and return success message', async () => {
            mockAppAuthService.addRecovery.mockResolvedValue(undefined);

            const result = await controller.addRecovery(user, appId, addRecoveryDto);

            expect(mockAppAuthService.addRecovery).toHaveBeenCalledWith(
                appId,
                user.id,
                addRecoveryDto.recoveryQuestion,
                addRecoveryDto.recoveryAnswer,
            );

            expect(result).toEqual({ message: 'Recovery question added successfully' });
        });
    });

    describe('listRecovery', () => {
        const appId = 1;
        const user = { id: 2, appId };
        const recoveryQuestions = {
            questions: [
                { id: 3, question: 'mock-recovery-question-1' },
                { id: 4, question: 'mock-recovery-question-2' },
            ],
        };

        it('should successfully return list of recovery questions', async () => {
            mockAppAuthService.listRecovery.mockResolvedValue(recoveryQuestions);

            const result = await controller.listRecovery(user, appId);

            expect(mockAppAuthService.listRecovery).toHaveBeenCalledWith(appId, user.id);

            expect(result).toEqual(recoveryQuestions);
        });
    });

    describe('askRecoveryQuestions', () => {
        const appId = 1;
        const recoveryAskDto = {
            email: 'application-user@example.com',
        };
        const recoveryQuestions = {
            questions: [
                { id: 1, question: 'mock-recovery-question-1' },
                { id: 2, question: 'mock-recovery-question-2' },
            ],
        };

        it('should successfully return recovery questions for email', async () => {
            mockAppAuthService.askRecoveryQuestions.mockResolvedValue(recoveryQuestions);

            const result = await controller.askRecoveryQuestions(appId, recoveryAskDto);

            expect(mockAppAuthService.askRecoveryQuestions).toHaveBeenCalledWith(appId, recoveryAskDto.email);

            expect(result).toEqual(recoveryQuestions);
        });
    });

    describe('resetPasswordByRecovery', () => {
        const appId = 1;
        const recoveryResetDto = {
            recoveryId: 2,
            email: 'application-user@example.com',
            answer: 'mock-recovery-answer',
            newPassword: 'mock-new-plain-password',
        };

        it('should successfully reset password and return success message', async () => {
            mockAppAuthService.resetPasswordByRecovery.mockResolvedValue(undefined);

            const result = await controller.resetPasswordByRecovery(appId, recoveryResetDto);

            expect(mockAppAuthService.resetPasswordByRecovery).toHaveBeenCalledWith(
                appId,
                recoveryResetDto.recoveryId,
                recoveryResetDto.email,
                recoveryResetDto.answer,
                recoveryResetDto.newPassword,
            );

            expect(result).toEqual({ message: 'Password reset successfully' });
        });
    });

    describe('updateRecovery', () => {
        const appId = 1;
        const user = { id: 2, appId };
        const recoveryId = 3;
        const updateRecoveryDto = {
            currentPassword: 'mock-plain-password',
            newQuestion: 'mock-new-recovery-question',
            newAnswer: 'mock-new-recovery-answer',
        };

        it('should successfully update recovery question and return success message', async () => {
            mockAppAuthService.updateRecovery.mockResolvedValue(undefined);

            const result = await controller.updateRecovery(user, appId, recoveryId, updateRecoveryDto);

            expect(mockAppAuthService.updateRecovery).toHaveBeenCalledWith(
                appId,
                user.id,
                recoveryId,
                updateRecoveryDto.currentPassword,
                updateRecoveryDto.newQuestion,
                updateRecoveryDto.newAnswer,
            );

            expect(result).toEqual({ message: 'Recovery question updated successfully' });
        });
    });

    describe('removeRecovery', () => {
        const appId = 1;
        const user = { id: 2, appId };
        const recoveryId = 3;
        const removeRecoveryDto = {
            currentPassword: 'mock-plain-password',
        };

        it('should successfully remove recovery question and return success message', async () => {
            mockAppAuthService.removeRecovery.mockResolvedValue(undefined);

            const result = await controller.removeRecovery(user, appId, recoveryId, removeRecoveryDto);

            expect(mockAppAuthService.removeRecovery).toHaveBeenCalledWith(
                appId,
                user.id,
                recoveryId,
                removeRecoveryDto.currentPassword,
            );

            expect(result).toEqual({ message: 'Recovery question removed successfully' });
        });
    });
});
