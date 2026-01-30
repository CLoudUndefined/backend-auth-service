import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { JwtServiceAuthGuard } from '../guards/jwt-service-auth.guard';
import { JwtServiceRefreshGuard } from '../guards/jwt-service-refresh.guard';

describe('AuthController', () => {
    let controller: AuthController;
    const mockAuthService = {
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
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        })
            .overrideGuard(JwtServiceAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(JwtServiceRefreshGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        const registerDto = {
            email: 'developer@example.com',
            password: 'mock-plain-password',
            recoveryQuestion: 'mock-recovery-question',
            recoveryAnswer: 'mock-recovery-answer',
        };
        const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        it('should successfully register a new user, return tokens', async () => {
            mockAuthService.register.mockResolvedValue(tokens);

            const result = await controller.register(registerDto);

            expect(mockAuthService.register).toHaveBeenCalledWith(
                registerDto.email,
                registerDto.password,
                registerDto.recoveryQuestion,
                registerDto.recoveryAnswer,
            );

            expect(result).toEqual(tokens);
        });
    });

    describe('login', () => {
        const loginDto = {
            email: 'developer@example.com',
            password: 'mock-plain-password',
        };
        const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        it('should successfully login and return tokens', async () => {
            mockAuthService.login.mockResolvedValue(tokens);

            const result = await controller.login(loginDto);

            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);

            expect(result).toEqual(tokens);
        });
    });

    describe('changePassword', () => {
        const user = { id: 1 };
        const changePasswordDto = {
            oldPassword: 'mock-old-plain-password',
            newPassword: 'mock-new-plain-password',
        };

        it('should successfully change password and return success message', async () => {
            mockAuthService.changePassword.mockResolvedValue(undefined);

            const result = await controller.changePassword(user, changePasswordDto);

            expect(mockAuthService.changePassword).toHaveBeenCalledWith(
                user.id,
                changePasswordDto.oldPassword,
                changePasswordDto.newPassword,
            );

            expect(result).toEqual({ message: 'Password changed successfully' });
        });
    });

    describe('refreshToken', () => {
        const refreshToken = 'mock-refresh-token';
        const tokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        it('should successfully refresh tokens', async () => {
            mockAuthService.refreshToken.mockResolvedValue(tokens);

            const result = await controller.refreshToken(refreshToken);

            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);

            expect(result).toEqual(tokens);
        });
    });

    describe('addRecovery', () => {
        const user = { id: 1 };
        const addRecoveryDto = {
            recoveryQuestion: 'mock-recovery-question',
            recoveryAnswer: 'mock-recovery-answer',
        };

        it('should successfully add recovery question and return success message', async () => {
            mockAuthService.addRecovery.mockResolvedValue(undefined);

            const result = await controller.addRecovery(user, addRecoveryDto);

            expect(mockAuthService.addRecovery).toHaveBeenCalledWith(
                user.id,
                addRecoveryDto.recoveryQuestion,
                addRecoveryDto.recoveryAnswer,
            );

            expect(result).toEqual({ message: 'Recovery question added successfully' });
        });
    });

    describe('listRecovery', () => {
        const user = { id: 1 };
        const recoveryQuestions = {
            questions: [
                { id: 2, question: 'mock-recovery-question-1' },
                { id: 3, question: 'mock-recovery-question-2' },
            ],
        };

        it('should successfully return list of recovery questions', async () => {
            mockAuthService.listRecovery.mockResolvedValue(recoveryQuestions);

            const result = await controller.listRecovery(user);

            expect(mockAuthService.listRecovery).toHaveBeenCalledWith(user.id);

            expect(result).toEqual(recoveryQuestions);
        });
    });

    describe('askRecoveryQuestions', () => {
        const recoveryAskDto = {
            email: 'developer@example.com',
        };
        const recoveryQuestions = {
            questions: [
                { id: 1, question: 'mock-recovery-question-1' },
                { id: 2, question: 'mock-recovery-question-2' },
            ],
        };

        it('should successfully return recovery questions for email', async () => {
            mockAuthService.askRecoveryQuestions.mockResolvedValue(recoveryQuestions);

            const result = await controller.askRecoveryQuestions(recoveryAskDto);

            expect(mockAuthService.askRecoveryQuestions).toHaveBeenCalledWith(recoveryAskDto.email);

            expect(result).toEqual(recoveryQuestions);
        });
    });

    describe('resetPasswordByRecovery', () => {
        const recoveryResetDto = {
            recoveryId: 1,
            email: 'developer@example.com',
            answer: 'mock-recovery-answer',
            newPassword: 'mock-plain-password',
        };

        it('should successfully reset password and return success message', async () => {
            mockAuthService.resetPasswordByRecovery.mockResolvedValue(undefined);

            const result = await controller.resetPasswordByRecovery(recoveryResetDto);

            expect(mockAuthService.resetPasswordByRecovery).toHaveBeenCalledWith(
                recoveryResetDto.recoveryId,
                recoveryResetDto.email,
                recoveryResetDto.answer,
                recoveryResetDto.newPassword,
            );

            expect(result).toEqual({ message: 'Password reset successfully' });
        });
    });

    describe('updateRecovery', () => {
        const user = { id: 1 };
        const recoveryId = 2;
        const updateRecoveryDto = {
            currentPassword: 'mock-plain-password',
            newQuestion: 'mock-recovery-question',
            newAnswer: 'mock-recovery-answer',
        };

        it('should successfully update recovery question and return success message', async () => {
            mockAuthService.updateRecovery.mockResolvedValue(undefined);

            const result = await controller.updateRecovery(user, recoveryId, updateRecoveryDto);

            expect(mockAuthService.updateRecovery).toHaveBeenCalledWith(
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
        const user = { id: 1 };
        const recoveryId = 2;
        const removeRecoveryDto = {
            currentPassword: 'mock-plain-password',
        };

        it('should successfully remove recovery question and return success message', async () => {
            mockAuthService.removeRecovery.mockResolvedValue(undefined);

            const result = await controller.removeRecovery(user, recoveryId, removeRecoveryDto);

            expect(mockAuthService.removeRecovery).toHaveBeenCalledWith(
                user.id,
                recoveryId,
                removeRecoveryDto.currentPassword,
            );

            expect(result).toEqual({ message: 'Recovery question removed successfully' });
        });
    });
});
