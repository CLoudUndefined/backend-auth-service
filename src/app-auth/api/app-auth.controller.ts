import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppUserResponseDto } from 'src/app-users/api/dto/app-user-response.dto';
import { ChangePasswordRequestDto } from 'src/common/api/dto/auth/change-password-request.dto';
import { LoginResponseDto } from 'src/common/api/dto/auth/login-response.dto';
import { LoginRequestDto } from 'src/common/api/dto/auth/login-request.dto';
import { RecoveryAskResponseDto } from 'src/common/api/dto/auth/recovery-ask-response.dto';
import { RecoveryAskRequestDto } from 'src/common/api/dto/auth/recovery-ask-request.dto';
import { RecoveryResetRequestDto } from 'src/common/api/dto/auth/recovery-reset-request.dto';
import { RegisterRequestDto } from 'src/common/api/dto/auth/register-request.dto';
import { UpdateRecoveryRequestDto } from 'src/common/api/dto/auth/update-recovery-request.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { AddRecoveryRequestDto } from 'src/common/api/dto/auth/add-recovery-request.dto';
import { ListRecoveryResponseDto } from 'src/common/api/dto/auth/list-recovery-response.dto';
import { RefreshTokenRequestDto } from 'src/common/api/dto/auth/refresh-token-request.dto';
import { AppAuthService } from '../service/app-auth.service';
import { JwtAppAuthGuard } from '../guards/jwt-app-auth.guard';
import { AppUser } from 'src/common/decorators/app-user.decorator';
import { ApplicationUserModel } from 'src/database/models/application-user.model';
import { RemoveRecoveryRequestDto } from 'src/common/api/dto/auth/remove-recovery-request.dto';

@ApiTags('App (User Auth)')
@Controller('apps/:appId/auth')
export class AppAuthController {
    constructor(private readonly appAuthService: AppAuthService) {}

    @Post('register')
    @ApiOperation({
        summary: 'Register new user in app',
        description: 'Registers a new app-user specifically for the app identified by appId.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 201,
        description: 'User registered',
        type: AppUserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    @ApiResponse({
        status: 409,
        description: 'User email already exists in this app',
    })
    async register(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() registerDto: RegisterRequestDto,
    ): Promise<AppUserResponseDto> {
        const user = await this.appAuthService.register(
            appId,
            registerDto.email,
            registerDto.password,
            registerDto.recoveryQuestion,
            registerDto.recoveryAnswer,
        );

        return new AppUserResponseDto(user);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login user into app',
        description: 'Authenticates an app-user against the specific app context.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    @ApiResponse({
        status: 403,
        description: 'User is banned',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async login(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() loginDto: LoginRequestDto,
    ): Promise<LoginResponseDto> {
        return this.appAuthService.login(appId, loginDto.email, loginDto.password);
    }

    @Post('change-password')
    @UseGuards(JwtAppAuthGuard)
    @ApiBearerAuth('JWT-auth-app')
    @ApiOperation({
        summary: 'Change password',
        description: 'Allows an authenticated app-user to change their password.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'App or user not found',
    })
    async changePassword(
        @AppUser() user: ApplicationUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Body() changePasswordDto: ChangePasswordRequestDto,
    ): Promise<MessageResponseDto> {
        await this.appAuthService.changePassword(
            appId,
            user.id,
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword,
        );

        return { message: 'Password changed successfully' };
    }

    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh specific app user token',
        description: 'Exchanges a valid Refresh Token for a new Access Token pair within the application context.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Tokens refreshed successfully',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired Refresh Token',
    })
    @ApiResponse({
        status: 403,
        description: 'User is banned',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async refreshToken(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() refreshTokenDto: RefreshTokenRequestDto,
    ): Promise<LoginResponseDto> {
        return this.appAuthService.refreshToken(appId, refreshTokenDto.refreshToken);
    }

    @Post('recovery')
    @UseGuards(JwtAppAuthGuard)
    @ApiBearerAuth('JWT-auth-app')
    @ApiOperation({
        summary: 'Add recovery question',
        description: 'Adds a new security question for password recovery.',
    })
    @ApiResponse({
        status: 201,
        description: 'Recovery question added successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'App or user not found',
    })
    async addRecovery(
        @AppUser() user: ApplicationUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Body() addRecoveryDto: AddRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        await this.appAuthService.addRecovery(
            appId,
            user.id,
            addRecoveryDto.recoveryQuestion,
            addRecoveryDto.recoveryAnswer,
        );

        return { message: 'Recovery question added successfully' };
    }

    @Get('recovery')
    @UseGuards(JwtAppAuthGuard)
    @ApiBearerAuth('JWT-auth-app')
    @ApiOperation({
        summary: 'List recovery questions',
        description: 'Returns all recovery questions for the authenticated app user.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of recovery questions',
        type: ListRecoveryResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'App or user not found',
    })
    async listRecovery(
        @AppUser() user: ApplicationUserModel,
        @Param('appId', ParseIntPipe) appId: number,
    ): Promise<ListRecoveryResponseDto> {
        return this.appAuthService.listRecovery(appId, user.id);
    }

    @Post('recovery/ask')
    @ApiOperation({
        summary: 'Get recovery questions',
        description: 'Retrieves the security questions for a user within this app.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Questions retrieved successfully',
        type: RecoveryAskResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 404,
        description: 'App or user not found',
    })
    async askRecoveryQuestions(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() recoveryAskDto: RecoveryAskRequestDto,
    ): Promise<RecoveryAskResponseDto> {
        return this.appAuthService.askRecoveryQuestions(appId, recoveryAskDto.email);
    }

    @Post('recovery/reset')
    @ApiOperation({
        summary: 'Reset password',
        description: 'Resets the password using the answer to the security question.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    @ApiResponse({
        status: 403,
        description: 'Recovery question does not belong to this user',
    })
    @ApiResponse({
        status: 404,
        description: 'App or user not found',
    })
    async resetPasswordByRecovery(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() recoveryResetDto: RecoveryResetRequestDto,
    ): Promise<MessageResponseDto> {
        await this.appAuthService.resetPasswordByRecovery(
            appId,
            recoveryResetDto.recoveryId,
            recoveryResetDto.email,
            recoveryResetDto.answer,
            recoveryResetDto.newPassword,
        );

        return { message: 'Password reset successfully' };
    }

    @Put('recovery/:recoveryId')
    @UseGuards(JwtAppAuthGuard)
    @ApiBearerAuth('JWT-auth-app')
    @ApiOperation({
        summary: 'Update recovery question',
        description: 'Updates an existing security question and/or answer.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'recoveryId',
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery question updated successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Recovery question does not belong to this user',
    })
    @ApiResponse({
        status: 404,
        description: 'App, user or recovery question not found',
    })
    async updateRecovery(
        @AppUser() user: ApplicationUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
        @Body() updateRecoveryDto: UpdateRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        await this.appAuthService.updateRecovery(
            appId,
            user.id,
            recoveryId,
            updateRecoveryDto.currentPassword,
            updateRecoveryDto.newQuestion,
            updateRecoveryDto.newAnswer,
        );

        return { message: 'Recovery question updated successfully' };
    }

    @Delete('recovery/:recoveryId')
    @UseGuards(JwtAppAuthGuard)
    @ApiBearerAuth('JWT-auth-app')
    @ApiOperation({
        summary: 'Remove recovery question',
        description: 'Removes a security question from the user.',
    })
    @ApiParam({
        name: 'appId',
        example: 1,
    })
    @ApiParam({
        name: 'recoveryId',
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery question removed successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'Recovery question does not belong to this user',
    })
    @ApiResponse({
        status: 404,
        description: 'App, user or recovery question not found',
    })
    async removeRecovery(
        @AppUser() user: ApplicationUserModel,
        @Param('appId', ParseIntPipe) appId: number,
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
        @Body() removeRecoveryDto: RemoveRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        await this.appAuthService.removeRecovery(appId, user.id, recoveryId, removeRecoveryDto.currentPassword);

        return { message: 'Recovery question removed successfully' };
    }
}
