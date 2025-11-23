import { Body, Controller, NotImplementedException, Post } from '@nestjs/common';
import { ServiceUserResponseDto } from 'src/service-users/dto/service-user-response.dto';
import { RegisterDto } from '../common/dto/auth/register.dto';
import { LoginDto } from '../common/dto/auth/login.dto';
import { ChangePasswordDto } from '../common/dto/auth/change-password.dto';
import { RecoveryAskDto } from '../common/dto/auth/recovery-ask.dto';
import { RecoveryResetDto } from '../common/dto/auth/recovery-reset.dto';
import { UpdateRecoveryDto } from '../common/dto/auth/update-recovery.dto';
import { LoginResponseDto } from '../common/dto/auth/login-response.dto';
import { RecoveryAskResponseDto } from '../common/dto/auth/recovery-ask-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { UpdateRecoveryResponseDto } from '../common/dto/auth/update-recovery-response.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Platform Auth (Service Owners)')
@Controller('auth')
export class AuthController {
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
    async register(@Body() registerDto: RegisterDto): Promise<ServiceUserResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('login')
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
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('change-password')
    @ApiBearerAuth('JWT-auth')
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
        description: 'Unauthorized or Wrong old password',
    })
    async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/ask')
    @ApiOperation({
        summary: 'Get recovery question',
        description: 'Retrieves the security question associated with the provided email.',
    })
    @ApiResponse({
        status: 200,
        description: 'Question retrieved successfully',
        type: RecoveryAskResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 404,
        description: 'User with this email not found',
    })
    async recoveryAsk(@Body() recoveryAskDto: RecoveryAskDto): Promise<RecoveryAskResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/reset')
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
    async recoveryReset(@Body() recoveryResetDto: RecoveryResetDto): Promise<MessageResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }

    @Post('recovery/update')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update recovery info',
        description: 'Updates the security question and answer for the authenticated user.',
    })
    @ApiResponse({
        status: 200,
        description: 'Recovery info updated',
        type: UpdateRecoveryResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized or Wrong password',
    })
    async updateRecovery(@Body() updateRecoveryDto: UpdateRecoveryDto): Promise<UpdateRecoveryResponseDto> {
        throw new NotImplementedException('Logic not implemented yet');
    }
}
