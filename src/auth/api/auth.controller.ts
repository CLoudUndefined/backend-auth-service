import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ServiceUserResponseDto } from 'src/service-users/api/dto/service-user-response.dto';
import { RegisterRequestDto } from 'src/common/api/dto/auth/register-request.dto';
import { LoginRequestDto } from 'src/common/api/dto/auth/login-request.dto';
import { ChangePasswordRequestDto } from 'src/common/api/dto/auth/change-password-request.dto';
import { RecoveryAskRequestDto } from 'src/common/api/dto/auth/recovery-ask-request.dto';
import { RecoveryResetRequestDto } from 'src/common/api/dto/auth/recovery-reset-request.dto';
import { LoginResponseDto } from 'src/common/api/dto/auth/login-response.dto';
import { MessageResponseDto } from 'src/common/api/dto/message-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddRecoveryRequestDto } from 'src/common/api/dto/auth/add-recovery-request.dto';
import { UpdateRecoveryRequestDto } from 'src/common/api/dto/auth/update-recovery-request.dto';
import { ListRecoveryResponseDto } from 'src/common/api/dto/auth/list-recovery-response.dto';
import { AuthService } from '../service/auth.service';
import { ServiceUser } from 'src/common/decorators/service-user.decorator';
import { ServiceUserModel } from 'src/database/models/service-user.model';
import { JwtServiceAuthGuard } from '../guards/jwt-service-auth.guard';
import { RemoveRecoveryRequestDto } from 'src/common/api/dto/auth/remove-recovery-request.dto';
import { JwtServiceRefreshGuard } from '../guards/jwt-service-refresh.guard';
import { BearerToken } from 'src/common/decorators/bearer-token.decorator';

@ApiTags('Service (User Auth)')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({
        summary: 'Register a new service user',
        description: 'Creates a new account for managing applications.',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: ServiceUserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 409,
        description: 'Email already exists',
    })
    async register(@Body() registerDto: RegisterRequestDto): Promise<ServiceUserResponseDto> {
        const user = await this.authService.register(
            registerDto.email,
            registerDto.password,
            registerDto.recoveryQuestion,
            registerDto.recoveryAnswer,
        );
        return new ServiceUserResponseDto(user);
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Login to platform',
        description: 'Authenticates a service user and returns a JWT token.',
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
        description: 'Invalid email or password',
    })
    async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('change-password')
    @HttpCode(200)
    @UseGuards(JwtServiceAuthGuard)
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Change password',
        description: 'Allows an authenticated user to change their password.',
    })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed or new password too weak',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async changePassword(
        @ServiceUser() user: ServiceUserModel,
        @Body() changePasswordDto: ChangePasswordRequestDto,
    ): Promise<MessageResponseDto> {
        await this.authService.changePassword(user.id, changePasswordDto.oldPassword, changePasswordDto.newPassword);

        return { message: 'Password changed successfully' };
    }

    @Post('refresh')
    @UseGuards(JwtServiceRefreshGuard)
    @ApiBearerAuth('JWT-refresh-service')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Exchanges a valid Refresh Token for a new Access Token and Refresh Token pair.',
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
    async refreshToken(@BearerToken() refreshToken: string): Promise<LoginResponseDto> {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('recovery')
    @UseGuards(JwtServiceAuthGuard)
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Add recovery question',
        description: 'Adds a new security question for password recovery.',
    })
    @ApiResponse({
        status: 201,
        description: 'Recovery question added',
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
    async addRecovery(
        @ServiceUser() user: ServiceUserModel,
        @Body() addRecoveryDto: AddRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        await this.authService.addRecovery(user.id, addRecoveryDto.recoveryQuestion, addRecoveryDto.recoveryAnswer);

        return { message: 'Recovery question added successfully' };
    }

    @Get('recovery')
    @UseGuards(JwtServiceAuthGuard)
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'List recovery questions',
        description: 'Returns all recovery questions for the authenticated user.',
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
    async listRecovery(@ServiceUser() user: ServiceUserModel): Promise<ListRecoveryResponseDto> {
        return this.authService.listRecovery(user.id);
    }

    @Post('recovery/ask')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Get recovery questions',
        description: 'Retrieves the security questions for the provided email.',
    })
    @ApiResponse({
        status: 200,
        description: 'Questions retrieved successfully',
        type: ListRecoveryResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    async askRecoveryQuestions(@Body() recoveryAskDto: RecoveryAskRequestDto): Promise<ListRecoveryResponseDto> {
        return this.authService.askRecoveryQuestions(recoveryAskDto.email);
    }

    @Post('recovery/reset')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Reset password',
        description: 'Resets the password using the answer to the security question.',
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset successful',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Wrong answer or invalid data',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async resetPasswordByRecovery(@Body() recoveryResetDto: RecoveryResetRequestDto): Promise<MessageResponseDto> {
        await this.authService.resetPasswordByRecovery(
            recoveryResetDto.recoveryId,
            recoveryResetDto.email,
            recoveryResetDto.answer,
            recoveryResetDto.newPassword,
        );

        return { message: 'Password reset successfully' };
    }

    @Put('recovery/:recoveryId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Update recovery question',
        description: 'Updates an existing security question and/or answer.',
    })
    @ApiParam({
        name: 'recoveryId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery question updated',
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
        description: 'Recovery question not found',
    })
    async updateRecovery(
        @ServiceUser() user: ServiceUserModel,
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
        @Body() updateRecoveryDto: UpdateRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        await this.authService.updateRecovery(
            user.id,
            recoveryId,
            updateRecoveryDto.currentPassword,
            updateRecoveryDto.newQuestion,
            updateRecoveryDto.newAnswer,
        );

        return { message: 'Recovery question updated successfully' };
    }

    @Delete('recovery/:recoveryId')
    @UseGuards(JwtServiceAuthGuard)
    @ApiBearerAuth('JWT-auth-service')
    @ApiOperation({
        summary: 'Remove recovery question',
        description: 'Removes a security question from the user.',
    })
    @ApiParam({
        name: 'recoveryId',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery question removed',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'Recovery question not found',
    })
    async removeRecovery(
        @ServiceUser() user: ServiceUserModel,
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
        @Body() removeRecoveryDto: RemoveRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        await this.authService.removeRecovery(user.id, recoveryId, removeRecoveryDto.currentPassword);

        return { message: 'Recovery question removed successfully' };
    }
}
