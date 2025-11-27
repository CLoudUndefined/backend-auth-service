import { Body, Controller, Delete, Get, NotImplementedException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppUserResponseDto } from 'src/app-users/dto/app-user-response.dto';
import { ChangePasswordRequestDto } from 'src/common/dto/auth/change-password-request.dto';
import { LoginResponseDto } from 'src/common/dto/auth/login-response.dto';
import { LoginRequestDto } from 'src/common/dto/auth/login-request.dto';
import { RecoveryAskResponseDto } from 'src/common/dto/auth/recovery-ask-response.dto';
import { RecoveryAskRequestDto } from 'src/common/dto/auth/recovery-ask-request.dto';
import { RecoveryResetRequestDto } from 'src/common/dto/auth/recovery-reset-request.dto';
import { RegisterRequestDto } from 'src/common/dto/auth/register-request.dto';
import { UpdateRecoveryRequestDto } from 'src/common/dto/auth/update-recovery-request.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { AddRecoveryRequestDto } from 'src/common/dto/auth/add-recovery-request.dto';
import { ListRecoveryResponseDto } from 'src/common/dto/auth/list-recovery-response.dto';
import { RefreshTokenRequestDto } from 'src/common/dto/auth/refresh-token-request.dto';

@ApiTags('App (User Auth)')
@Controller('apps/:appId/auth')
export class AppAuthController {
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
        throw new NotImplementedException('Logic not implemented yet');
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
        status: 404,
        description: 'App not found',
    })
    async login(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() loginDto: LoginRequestDto,
    ): Promise<LoginResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('change-password')
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
        description: 'Password changed',
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
        description: 'App not found',
    })
    async changePassword(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() changePasswordDto: ChangePasswordRequestDto,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
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
        status: 404,
        description: 'App not found',
    })
    async refresh(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() refreshDto: RefreshTokenRequestDto,
    ): Promise<LoginResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery')
    @ApiBearerAuth('JWT-auth-app')
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
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async addRecovery(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() addDto: AddRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Get('recovery')
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
        description: 'App not found',
    })
    async listRecovery(@Param('appId', ParseIntPipe) appId: number): Promise<ListRecoveryResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
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
        description: 'App not found',
    })
    async recoveryAsk(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() recoveryAskDto: RecoveryAskRequestDto,
    ): Promise<RecoveryAskResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
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
        description: 'Wrong answer or invalid data',
    })
    @ApiResponse({
        status: 404,
        description: 'App not found',
    })
    async recoveryReset(
        @Param('appId', ParseIntPipe) appId: number,
        @Body() recoveryResetDto: RecoveryResetRequestDto,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Put('recovery/:recoveryId')
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
        description: 'App or recovery question not found',
    })
    async updateRecovery(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
        @Body() updateDto: UpdateRecoveryRequestDto,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Delete('recovery/:recoveryId')
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
        description: 'Recovery question removed',
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
        description: 'App or recovery question not found',
    })
    async removeRecovery(
        @Param('appId', ParseIntPipe) appId: number,
        @Param('recoveryId', ParseIntPipe) recoveryId: number,
    ): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
