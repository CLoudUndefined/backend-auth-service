import { Body, Controller, NotImplementedException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppUserResponseDto } from 'src/app-users/dto/app-user-response.dto';
import { ChangePasswordDto } from 'src/common/dto/auth/change-password.dto';
import { LoginResponseDto } from 'src/common/dto/auth/login-response.dto';
import { LoginDto } from 'src/common/dto/auth/login.dto';
import { RecoveryAskResponseDto } from 'src/common/dto/auth/recovery-ask-response.dto';
import { RecoveryAskDto } from 'src/common/dto/auth/recovery-ask.dto';
import { RecoveryResetDto } from 'src/common/dto/auth/recovery-reset.dto';
import { RegisterDto } from 'src/common/dto/auth/register.dto';
import { UpdateRecoveryResponseDto } from 'src/common/dto/auth/update-recovery-response.dto';
import { UpdateRecoveryDto } from 'src/common/dto/auth/update-recovery.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';5

@ApiTags('App Auth (App-Users)')
@Controller('apps/:appId/auth')
export class AppAuthController {
    @Post('register')
    @ApiOperation({
        summary: 'Register new user in app',
        description: 'Registers a new app-user specifically for the app identified by appId.',
    })
    @ApiParam({
        name: 'appId',
        description: 'Target App ID',
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
    async register(@Param('appId', ParseIntPipe) appId: number, @Body() registerDto: RegisterDto): Promise<AppUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login user into app',
        description: 'Authenticates an app-user against the specific app context.',
    })
    @ApiParam({
        name: 'appId',
        description: 'Target App ID',
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
    async login(@Param('appId', ParseIntPipe) appId: number, @Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('change-password')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Change password',
        description: 'Allows an authenticated app-user to change their password.',
    })
    @ApiParam({
        name: 'appId',
        description: 'Target App ID',
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
    async changePassword(@Param('appId', ParseIntPipe) appId: number, @Body() changePasswordDto: ChangePasswordDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/ask')
    @ApiOperation({
        summary: 'Ask recovery question',
        description: 'Retrieves the recovery question for a user within this app.',
    })
    @ApiParam({
        name: 'appId',
        description: 'Target App ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Question retrieved',
        type: RecoveryAskResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async recoveryAsk(@Param('appId', ParseIntPipe) appId: number, @Body() recoveryAskDto: RecoveryAskDto): Promise<RecoveryAskResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/reset')
    @ApiOperation({
        summary: 'Reset password via recovery',
        description: 'Resets end-user password using the recovery answer.',
    })
    @ApiParam({
        name: 'appId',
        description: 'Target App ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        type: MessageResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Wrong answer',
    })
    @ApiResponse({
        status: 404,
        description: 'App or User not found',
    })
    async recoveryReset(@Param('appId', ParseIntPipe) appId: number, @Body() recoveryResetDto: RecoveryResetDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/update')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update recovery data',
        description: 'Updates security question for an authenticated app-user.',
    })
    @ApiParam({
        name: 'appId',
        description: 'Target App ID',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'Updated successfully',
        type: UpdateRecoveryResponseDto,
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
    async updateRecovery(@Param('appId', ParseIntPipe) appId: number, @Body() updateRecoveryDto: UpdateRecoveryDto): Promise<UpdateRecoveryResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
